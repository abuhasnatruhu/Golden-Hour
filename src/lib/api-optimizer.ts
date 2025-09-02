interface RequestConfig {
  url: string
  options?: RequestInit
  timeout?: number
  retries?: number
  priority?: 'high' | 'medium' | 'low'
  cacheKey?: string
}

interface BatchRequest {
  id: string
  config: RequestConfig
  resolve: (value: any) => void
  reject: (error: any) => void
  timestamp: number
}

interface RequestResult {
  success: boolean
  data?: any
  error?: string
  duration: number
  fromCache?: boolean
}

class APIOptimizer {
  private requestQueue: BatchRequest[] = []
  private processingBatch = false
  private batchSize = 5
  private batchTimeout = 100 // ms
  private requestCache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private rateLimiter = new Map<string, { count: number; resetTime: number }>()
  private circuitBreaker = new Map<string, { failures: number; lastFailure: number; isOpen: boolean }>()
  
  // Rate limiting configuration
  private readonly RATE_LIMITS = {
    'nominatim.openstreetmap.org': { requests: 1, window: 1000 }, // 1 req/sec
    'ipapi.co': { requests: 1000, window: 60000 }, // 1000 req/min
    'ip-api.com': { requests: 45, window: 60000 }, // 45 req/min
    'timeapi.io': { requests: 100, window: 60000 }, // 100 req/min
    'api.geonames.org': { requests: 1000, window: 3600000 }, // 1000 req/hour
  }
  
  // Circuit breaker configuration
  private readonly CIRCUIT_BREAKER_CONFIG = {
    failureThreshold: 5,
    resetTimeout: 30000, // 30 seconds
  }

  async request<T>(config: RequestConfig): Promise<T> {
    // Check cache first
    if (config.cacheKey) {
      const cached = this.getFromCache(config.cacheKey)
      if (cached) {
        return cached as T
      }
    }

    // Check circuit breaker
    const domain = this.extractDomain(config.url)
    if (this.isCircuitOpen(domain)) {
      throw new Error(`Circuit breaker is open for ${domain}`)
    }

    // Check rate limiting
    if (!this.checkRateLimit(domain)) {
      // Queue the request if rate limited
      return this.queueRequest<T>(config)
    }

    return this.executeRequest<T>(config)
  }

  private async queueRequest<T>(config: RequestConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      const batchRequest: BatchRequest = {
        id: this.generateId(),
        config,
        resolve,
        reject,
        timestamp: Date.now()
      }

      // Insert based on priority
      const priority = config.priority || 'medium'
      const priorityIndex = this.getPriorityIndex(priority)
      
      let insertIndex = this.requestQueue.length
      for (let i = 0; i < this.requestQueue.length; i++) {
        const queuePriority = this.requestQueue[i].config.priority || 'medium'
        if (this.getPriorityIndex(queuePriority) > priorityIndex) {
          insertIndex = i
          break
        }
      }
      
      this.requestQueue.splice(insertIndex, 0, batchRequest)
      this.processBatch()
    })
  }

  private async processBatch(): Promise<void> {
    if (this.processingBatch || this.requestQueue.length === 0) {
      return
    }

    this.processingBatch = true

    // Wait for batch timeout or until batch is full
    await new Promise(resolve => setTimeout(resolve, this.batchTimeout))

    const batch = this.requestQueue.splice(0, Math.min(this.batchSize, this.requestQueue.length))
    
    if (batch.length === 0) {
      this.processingBatch = false
      return
    }

    // Group requests by domain for better rate limiting
    const domainGroups = new Map<string, BatchRequest[]>()
    
    for (const request of batch) {
      const domain = this.extractDomain(request.config.url)
      if (!domainGroups.has(domain)) {
        domainGroups.set(domain, [])
      }
      domainGroups.get(domain)!.push(request)
    }

    // Process each domain group with appropriate delays
    const promises: Promise<void>[] = []
    
    for (const [domain, requests] of domainGroups) {
      promises.push(this.processDomainBatch(domain, requests))
    }

    await Promise.allSettled(promises)
    
    this.processingBatch = false
    
    // Continue processing if there are more requests
    if (this.requestQueue.length > 0) {
      this.processBatch()
    }
  }

  private async processDomainBatch(domain: string, requests: BatchRequest[]): Promise<void> {
    const rateLimit = this.RATE_LIMITS[domain as keyof typeof this.RATE_LIMITS]
    
    if (!rateLimit) {
      // No rate limit, process all in parallel
      const promises = requests.map(request => this.executeRequestFromBatch(request))
      await Promise.allSettled(promises)
      return
    }

    // Process with rate limiting
    const delay = rateLimit.window / rateLimit.requests
    
    for (let i = 0; i < requests.length; i++) {
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      
      if (this.checkRateLimit(domain)) {
        this.executeRequestFromBatch(requests[i])
      } else {
        // Re-queue if rate limit exceeded
        this.requestQueue.unshift(requests[i])
      }
    }
  }

  private async executeRequestFromBatch(batchRequest: BatchRequest): Promise<void> {
    try {
      const result = await this.executeRequest(batchRequest.config)
      batchRequest.resolve(result)
    } catch (error) {
      batchRequest.reject(error)
    }
  }

  private async executeRequest<T>(config: RequestConfig): Promise<T> {
    const startTime = Date.now()
    const domain = this.extractDomain(config.url)
    const timeout = config.timeout || 8000
    const retries = config.retries || 3

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Add exponential backoff for retries
        if (attempt > 0) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
          await new Promise(resolve => setTimeout(resolve, delay))
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(config.url, {
          ...config.options,
          signal: controller.signal,
          headers: {
            'User-Agent': 'Golden-Hour-Calculator/1.0',
            ...config.options?.headers,
          },
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        const duration = Date.now() - startTime

        // Cache successful response
        if (config.cacheKey) {
          this.setCache(config.cacheKey, data, this.getCacheTTL(domain))
        }

        // Reset circuit breaker on success
        this.resetCircuitBreaker(domain)

        return data as T
      } catch (error) {
        lastError = error as Error
        
        // Record failure for circuit breaker
        this.recordFailure(domain)
        
        // Don't retry on certain errors
        if (error instanceof Error) {
          if (error.name === 'AbortError' || error.message.includes('404')) {
            break
          }
        }
      }
    }

    throw lastError || new Error('Request failed after all retries')
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname
    } catch {
      return 'unknown'
    }
  }

  private checkRateLimit(domain: string): boolean {
    const rateLimit = this.RATE_LIMITS[domain as keyof typeof this.RATE_LIMITS]
    if (!rateLimit) return true

    const now = Date.now()
    const limiter = this.rateLimiter.get(domain)

    if (!limiter || now >= limiter.resetTime) {
      this.rateLimiter.set(domain, {
        count: 1,
        resetTime: now + rateLimit.window
      })
      return true
    }

    if (limiter.count < rateLimit.requests) {
      limiter.count++
      return true
    }

    return false
  }

  private isCircuitOpen(domain: string): boolean {
    const breaker = this.circuitBreaker.get(domain)
    if (!breaker) return false

    if (breaker.isOpen) {
      const now = Date.now()
      if (now - breaker.lastFailure > this.CIRCUIT_BREAKER_CONFIG.resetTimeout) {
        breaker.isOpen = false
        breaker.failures = 0
        return false
      }
      return true
    }

    return false
  }

  private recordFailure(domain: string): void {
    const breaker = this.circuitBreaker.get(domain) || { failures: 0, lastFailure: 0, isOpen: false }
    
    breaker.failures++
    breaker.lastFailure = Date.now()
    
    if (breaker.failures >= this.CIRCUIT_BREAKER_CONFIG.failureThreshold) {
      breaker.isOpen = true
    }
    
    this.circuitBreaker.set(domain, breaker)
  }

  private resetCircuitBreaker(domain: string): void {
    this.circuitBreaker.delete(domain)
  }

  private getFromCache(key: string): any | null {
    const cached = this.requestCache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now > cached.timestamp + cached.ttl) {
      this.requestCache.delete(key)
      return null
    }

    return cached.data
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.requestCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })

    // Cleanup old cache entries
    if (this.requestCache.size > 1000) {
      this.cleanupCache()
    }
  }

  private cleanupCache(): void {
    const now = Date.now()
    for (const [key, cached] of this.requestCache) {
      if (now > cached.timestamp + cached.ttl) {
        this.requestCache.delete(key)
      }
    }
  }

  private getCacheTTL(domain: string): number {
    // Different TTL based on service reliability
    const ttlMap: Record<string, number> = {
      'nominatim.openstreetmap.org': 60 * 60 * 1000, // 1 hour
      'ipapi.co': 30 * 60 * 1000, // 30 minutes
      'ip-api.com': 30 * 60 * 1000, // 30 minutes
      'timeapi.io': 60 * 60 * 1000, // 1 hour
      'api.geonames.org': 60 * 60 * 1000, // 1 hour
    }
    
    return ttlMap[domain] || 15 * 60 * 1000 // Default 15 minutes
  }

  private getPriorityIndex(priority: string): number {
    const priorities = { high: 0, medium: 1, low: 2 }
    return priorities[priority as keyof typeof priorities] || 1
  }

  private generateId(): string {
    // Use timestamp + counter for stable ID generation
    const timestamp = new Date().getTime()
    const counter = (this.idCounter = (this.idCounter || 0) + 1)
    return `${timestamp}-${counter}`
  }
  
  private idCounter: number = 0

  // Public methods for monitoring
  getStats() {
    return {
      queueLength: this.requestQueue.length,
      cacheSize: this.requestCache.size,
      rateLimiters: Object.fromEntries(this.rateLimiter),
      circuitBreakers: Object.fromEntries(this.circuitBreaker),
    }
  }

  clearCache(): void {
    this.requestCache.clear()
  }

  // Batch multiple requests with different priorities
  async batchRequests(requests: RequestConfig[]): Promise<RequestResult[]> {
    const promises = requests.map(async (config, index) => {
      const startTime = Date.now()
      try {
        const data = await this.request(config)
        return {
          success: true,
          data,
          duration: Date.now() - startTime,
          fromCache: !!config.cacheKey && !!this.getFromCache(config.cacheKey)
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - startTime
        }
      }
    })

    return Promise.allSettled(promises).then(results => 
      results.map(result => 
        result.status === 'fulfilled' ? result.value : {
          success: false,
          error: 'Promise rejected',
          duration: 0
        }
      )
    )
  }
}

// Global instance
export const apiOptimizer = new APIOptimizer()
export type { RequestConfig, RequestResult }
