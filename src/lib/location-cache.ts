interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
  quality: number
  source: string
  accessCount: number
  lastAccessed: number
}

interface CacheConfig {
  maxSize: number
  defaultTTL: number
  maxAge: number
  cleanupInterval: number
  persistToStorage: boolean
}

export class IntelligentCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private config: CacheConfig
  private cleanupTimer: NodeJS.Timeout | null = null
  private storageKey: string

  constructor(storageKey: string, config: Partial<CacheConfig> = {}) {
    this.storageKey = storageKey
    this.config = {
      maxSize: 100,
      defaultTTL: 30 * 60 * 1000, // 30 minutes
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      persistToStorage: true,
      ...config
    }

    this.loadFromStorage()
    this.startCleanupTimer()
  }

  set(key: string, data: T, options: {
    ttl?: number
    quality?: number
    source?: string
  } = {}): void {
    const now = Date.now()
    const ttl = options.ttl || this.config.defaultTTL
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiry: now + ttl,
      quality: options.quality || 50,
      source: options.source || 'unknown',
      accessCount: 0,
      lastAccessed: now
    }

    // If cache is full, remove least valuable entries
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastValuable()
    }

    this.cache.set(key, entry)
    this.persistToStorage()
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    
    // Check if expired
    if (now > entry.expiry) {
      this.cache.delete(key)
      this.persistToStorage()
      return null
    }

    // Check if too old
    if (now - entry.timestamp > this.config.maxAge) {
      this.cache.delete(key)
      this.persistToStorage()
      return null
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = now
    
    return entry.data
  }

  getWithMetadata(key: string): { data: T; metadata: Omit<CacheEntry<T>, 'data'> } | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    
    // Check if expired or too old
    if (now > entry.expiry || now - entry.timestamp > this.config.maxAge) {
      this.cache.delete(key)
      this.persistToStorage()
      return null
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = now
    
    const { data, ...metadata } = entry
    return { data, metadata }
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  isStale(key: string, staleTTL: number = 10 * 60 * 1000): boolean {
    const entry = this.cache.get(key)
    if (!entry) return true

    const now = Date.now()
    return (now - entry.timestamp) > staleTTL
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.persistToStorage()
    }
    return deleted
  }

  clear(): void {
    this.cache.clear()
    this.persistToStorage()
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  // Get cache statistics
  getStats(): {
    size: number
    totalEntries: number
    averageQuality: number
    oldestEntry: number
    newestEntry: number
    sources: Record<string, number>
  } {
    const entries = Array.from(this.cache.values())
    const now = Date.now()
    
    const sources: Record<string, number> = {}
    let totalQuality = 0
    let oldestTimestamp = now
    let newestTimestamp = 0

    entries.forEach(entry => {
      sources[entry.source] = (sources[entry.source] || 0) + 1
      totalQuality += entry.quality
      oldestTimestamp = Math.min(oldestTimestamp, entry.timestamp)
      newestTimestamp = Math.max(newestTimestamp, entry.timestamp)
    })

    return {
      size: this.cache.size,
      totalEntries: entries.length,
      averageQuality: entries.length > 0 ? totalQuality / entries.length : 0,
      oldestEntry: oldestTimestamp,
      newestEntry: newestTimestamp,
      sources
    }
  }

  private evictLeastValuable(): void {
    const entries = Array.from(this.cache.entries())
    const now = Date.now()
    
    // Calculate value score for each entry
    const scored = entries.map(([key, entry]) => {
      const age = now - entry.timestamp
      const recency = now - entry.lastAccessed
      
      // Higher quality, more recent access, and newer entries get higher scores
      const score = entry.quality * 0.4 + 
                   (entry.accessCount / Math.max(1, age / (24 * 60 * 60 * 1000))) * 0.3 +
                   (1 / Math.max(1, recency / (60 * 60 * 1000))) * 0.3
      
      return { key, score }
    })

    // Sort by score (lowest first) and remove the least valuable
    scored.sort((a, b) => a.score - b.score)
    const toRemove = Math.ceil(this.config.maxSize * 0.1) // Remove 10%
    
    for (let i = 0; i < toRemove && i < scored.length; i++) {
      this.cache.delete(scored[i].key)
    }
  }

  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.cache.forEach((entry, key) => {
      if (now > entry.expiry || now - entry.timestamp > this.config.maxAge) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.cache.delete(key))
    
    if (keysToDelete.length > 0) {
      this.persistToStorage()
    }
  }

  private loadFromStorage(): void {
    if (!this.config.persistToStorage || typeof window === 'undefined') {
      return
    }

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        const now = Date.now()
        
        // Only load non-expired entries
        Object.entries(data).forEach(([key, entry]: [string, any]) => {
          if (entry && typeof entry === 'object' && 
              entry.expiry > now && 
              now - entry.timestamp < this.config.maxAge) {
            this.cache.set(key, entry)
          }
        })
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error)
    }
  }

  private persistToStorage(): void {
    if (!this.config.persistToStorage || typeof window === 'undefined') {
      return
    }

    try {
      const data = Object.fromEntries(this.cache.entries())
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to persist cache to storage:', error)
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.cache.clear()
  }
}

// Specialized location cache
export class LocationCache extends IntelligentCache<any> {
  constructor() {
    super('golden-hour-location-cache', {
      maxSize: 50,
      defaultTTL: 30 * 60 * 1000, // 30 minutes
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      cleanupInterval: 10 * 60 * 1000, // 10 minutes
      persistToStorage: true
    })
  }

  // Specialized methods for location data
  setLocation(key: string, location: any, source: string = 'unknown'): void {
    const quality = this.calculateLocationQuality(location)
    this.set(key, location, {
      quality,
      source,
      ttl: this.getTTLByQuality(quality)
    })
  }

  private calculateLocationQuality(location: any): number {
    let quality = 0
    
    // Base quality from confidence
    if (location.confidence) {
      quality += location.confidence * 50
    }
    
    // Accuracy bonus
    if (location.accuracy?.includes('GPS')) quality += 40
    else if (location.accuracy?.includes('IP')) quality += 25
    else if (location.accuracy?.includes('Timezone')) quality += 10
    
    // Data completeness
    if (location.city && location.country) quality += 15
    if (location.state) quality += 5
    if (location.timezone) quality += 5
    if (location.lat && location.lon) quality += 10
    
    return Math.min(100, quality)
  }

  private getTTLByQuality(quality: number): number {
    if (quality >= 80) return 60 * 60 * 1000 // 1 hour for high quality
    if (quality >= 60) return 30 * 60 * 1000 // 30 minutes for medium quality
    return 15 * 60 * 1000 // 15 minutes for low quality
  }
}

// Global location cache instance
export const locationCache = new LocationCache()
