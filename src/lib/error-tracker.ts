interface ErrorEvent {
  message: string
  source?: string
  lineno?: number
  colno?: number
  error?: Error
  timestamp: Date
  userAgent: string
  url: string
}

interface PerformanceMetric {
  name: string
  value: number
  timestamp: Date
}

class ErrorTracker {
  private errors: ErrorEvent[] = []
  private metrics: PerformanceMetric[] = []
  private maxErrors = 100
  private maxMetrics = 1000

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupErrorHandlers()
      this.setupPerformanceObserver()
    }
  }

  private setupErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      })
    })

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        error: new Error(event.reason),
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      })
    })
  }

  private setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      // Track Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.logMetric('LCP', lastEntry.startTime)
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // Track First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.logMetric('FID', entry.processingStart - entry.startTime)
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Track Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        this.logMetric('CLS', clsValue)
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    }
  }

  logError(error: Partial<ErrorEvent>) {
    const errorEvent: ErrorEvent = {
      message: error.message || 'Unknown error',
      source: error.source,
      lineno: error.lineno,
      colno: error.colno,
      error: error.error,
      timestamp: error.timestamp || new Date(),
      userAgent: error.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
      url: error.url || (typeof window !== 'undefined' ? window.location.href : ''),
    }

    this.errors.push(errorEvent)
    
    // Keep only the last N errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Tracker]', errorEvent)
    }

    // In production, you could send to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(errorEvent)
    }
  }

  logMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date(),
    }

    this.metrics.push(metric)
    
    // Keep only the last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`)
    }
  }

  private sendToErrorService(error: ErrorEvent) {
    // In a real application, you would send this to a service like Sentry, LogRocket, etc.
    // For now, we'll just store in localStorage as a demo
    try {
      const storedErrors = localStorage.getItem('app_errors')
      const errors = storedErrors ? JSON.parse(storedErrors) : []
      errors.push({
        ...error,
        timestamp: error.timestamp.toISOString(),
      })
      // Keep only last 50 errors in localStorage
      const recentErrors = errors.slice(-50)
      localStorage.setItem('app_errors', JSON.stringify(recentErrors))
    } catch (e) {
      // Fail silently if localStorage is not available
    }
  }

  getErrors() {
    return this.errors
  }

  getMetrics() {
    return this.metrics
  }

  getMetricsSummary() {
    const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {}
    
    this.metrics.forEach((metric) => {
      if (!summary[metric.name]) {
        summary[metric.name] = { avg: 0, min: Infinity, max: -Infinity, count: 0 }
      }
      
      const s = summary[metric.name]
      s.count++
      s.min = Math.min(s.min, metric.value)
      s.max = Math.max(s.max, metric.value)
      s.avg = (s.avg * (s.count - 1) + metric.value) / s.count
    })
    
    return summary
  }

  clearErrors() {
    this.errors = []
  }

  clearMetrics() {
    this.metrics = []
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker()

// React Error Boundary integration
export function logErrorToService(error: Error, errorInfo: any) {
  errorTracker.logError({
    message: error.message,
    error,
    source: errorInfo?.componentStack,
  })
}