import { LocationData } from './location-service'
import { locationDatabase } from './location-database'

export interface URLMetrics {
  url: string
  views: number
  uniqueVisitors: number
  bounceRate: number
  avgSessionDuration: number
  conversionRate: number
  seoScore: number
  loadTime: number
  mobileOptimization: number
  socialShares: number
  backlinks: number
  searchRanking: number
  clickThroughRate: number
  lastUpdated: Date
}

export interface LocationAnalytics {
  location: string
  coordinates: { lat: number; lng: number }
  totalViews: number
  uniqueVisitors: number
  popularTimes: { hour: number; views: number }[]
  seasonalTrends: { month: number; views: number }[]
  deviceBreakdown: { desktop: number; mobile: number; tablet: number }
  trafficSources: { organic: number; direct: number; social: number; referral: number }
  topKeywords: string[]
  competitorUrls: string[]
  performanceScore: number
}

export interface AnalyticsReport {
  summary: {
    totalUrls: number
    totalViews: number
    avgSeoScore: number
    topPerformingLocation: string
    growthRate: number
  }
  topLocations: LocationAnalytics[]
  underperformingUrls: URLMetrics[]
  recommendations: string[]
  trends: {
    daily: { date: string; views: number }[]
    weekly: { week: string; views: number }[]
    monthly: { month: string; views: number }[]
  }
}

export class URLAnalytics {
  private metrics: Map<string, URLMetrics> = new Map()
  private locationAnalytics: Map<string, LocationAnalytics> = new Map()

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData(): void {
    // Initialize with realistic mock data for demonstration
    const popularLocations = locationDatabase.getPopularLocations(20)
    
    popularLocations.forEach((location, index) => {
      const baseViews = Math.floor(Math.random() * 10000) + 1000
      const url = `/golden-hour/${location.urlSlug}`
      
      // URL Metrics
      const urlMetrics: URLMetrics = {
        url,
        views: baseViews,
        uniqueVisitors: Math.floor(baseViews * 0.7),
        bounceRate: 0.3 + Math.random() * 0.4,
        avgSessionDuration: 120 + Math.random() * 300,
        conversionRate: 0.02 + Math.random() * 0.08,
        seoScore: location.seoScore,
        loadTime: 1.2 + Math.random() * 2,
        mobileOptimization: 80 + Math.random() * 20,
        socialShares: Math.floor(baseViews * 0.05),
        backlinks: Math.floor(Math.random() * 50) + 5,
        searchRanking: Math.floor(Math.random() * 100) + 1,
        clickThroughRate: 0.02 + Math.random() * 0.06,
        lastUpdated: new Date()
      }
      
      this.metrics.set(url, urlMetrics)
      
      // Location Analytics
      const locationAnalytics: LocationAnalytics = {
        location: location.name,
        coordinates: location.coordinates,
        totalViews: baseViews,
        uniqueVisitors: urlMetrics.uniqueVisitors,
        popularTimes: this.generatePopularTimes(),
        seasonalTrends: this.generateSeasonalTrends(),
        deviceBreakdown: {
          desktop: Math.floor(baseViews * 0.4),
          mobile: Math.floor(baseViews * 0.5),
          tablet: Math.floor(baseViews * 0.1)
        },
        trafficSources: {
          organic: Math.floor(baseViews * 0.6),
          direct: Math.floor(baseViews * 0.2),
          social: Math.floor(baseViews * 0.15),
          referral: Math.floor(baseViews * 0.05)
        },
        topKeywords: location.keywords.slice(0, 5),
        competitorUrls: this.generateCompetitorUrls(location.name),
        performanceScore: this.calculatePerformanceScore(urlMetrics)
      }
      
      this.locationAnalytics.set(location.name, locationAnalytics)
    })
  }

  private generatePopularTimes(): { hour: number; views: number }[] {
    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      views: Math.floor(Math.random() * 100) + 10
    }))
  }

  private generateSeasonalTrends(): { month: number; views: number }[] {
    return Array.from({ length: 12 }, (_, month) => ({
      month: month + 1,
      views: Math.floor(Math.random() * 1000) + 200
    }))
  }

  private generateCompetitorUrls(location: string): string[] {
    const competitors = [
      'timeanddate.com',
      'sunrisesunset.com',
      'photoephemeris.com',
      'suncalc.org'
    ]
    
    return competitors.map(domain => 
      `https://${domain}/${location.toLowerCase().replace(/\s+/g, '-')}`
    )
  }

  private calculatePerformanceScore(metrics: URLMetrics): number {
    const seoWeight = 0.3
    const trafficWeight = 0.25
    const engagementWeight = 0.25
    const technicalWeight = 0.2
    
    const seoScore = metrics.seoScore
    const trafficScore = Math.min(metrics.views / 100, 100)
    const engagementScore = (1 - metrics.bounceRate) * 100
    const technicalScore = (metrics.mobileOptimization + (100 - metrics.loadTime * 10)) / 2
    
    return Math.round(
      seoScore * seoWeight +
      trafficScore * trafficWeight +
      engagementScore * engagementWeight +
      technicalScore * technicalWeight
    )
  }

  // Public Methods
  getURLMetrics(url: string): URLMetrics | null {
    return this.metrics.get(url) || null
  }

  getLocationAnalytics(location: string): LocationAnalytics | null {
    return this.locationAnalytics.get(location) || null
  }

  getAllMetrics(): URLMetrics[] {
    return Array.from(this.metrics.values())
  }

  getAllLocationAnalytics(): LocationAnalytics[] {
    return Array.from(this.locationAnalytics.values())
  }

  getTopPerformingUrls(limit: number = 10): URLMetrics[] {
    return this.getAllMetrics()
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)
  }

  getUnderperformingUrls(threshold: number = 500): URLMetrics[] {
    return this.getAllMetrics()
      .filter(metric => metric.views < threshold)
      .sort((a, b) => a.views - b.views)
  }

  getLocationsByPerformance(limit: number = 10): LocationAnalytics[] {
    return this.getAllLocationAnalytics()
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, limit)
  }

  generateReport(): AnalyticsReport {
    const allMetrics = this.getAllMetrics()
    const allLocations = this.getAllLocationAnalytics()
    
    const totalViews = allMetrics.reduce((sum, metric) => sum + metric.views, 0)
    const avgSeoScore = allMetrics.reduce((sum, metric) => sum + metric.seoScore, 0) / allMetrics.length
    const topLocation = allLocations.sort((a, b) => b.totalViews - a.totalViews)[0]
    
    return {
      summary: {
        totalUrls: allMetrics.length,
        totalViews,
        avgSeoScore: Math.round(avgSeoScore),
        topPerformingLocation: topLocation?.location || 'N/A',
        growthRate: 0.15 // Mock growth rate
      },
      topLocations: this.getLocationsByPerformance(5),
      underperformingUrls: this.getUnderperformingUrls().slice(0, 5),
      recommendations: this.generateRecommendations(allMetrics),
      trends: this.generateTrends()
    }
  }

  private generateRecommendations(metrics: URLMetrics[]): string[] {
    const recommendations: string[] = []
    
    const avgLoadTime = metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length
    if (avgLoadTime > 3) {
      recommendations.push('Optimize page load times - average is above 3 seconds')
    }
    
    const lowSeoUrls = metrics.filter(m => m.seoScore < 70).length
    if (lowSeoUrls > 0) {
      recommendations.push(`Improve SEO for ${lowSeoUrls} URLs with scores below 70`)
    }
    
    const highBounceUrls = metrics.filter(m => m.bounceRate > 0.6).length
    if (highBounceUrls > 0) {
      recommendations.push(`Reduce bounce rate for ${highBounceUrls} URLs above 60%`)
    }
    
    const lowMobileUrls = metrics.filter(m => m.mobileOptimization < 85).length
    if (lowMobileUrls > 0) {
      recommendations.push(`Improve mobile optimization for ${lowMobileUrls} URLs`)
    }
    
    return recommendations
  }

  private generateTrends(): AnalyticsReport['trends'] {
    const now = new Date()
    
    return {
      daily: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        return {
          date: date.toISOString().split('T')[0],
          views: Math.floor(Math.random() * 1000) + 500
        }
      }).reverse(),
      weekly: Array.from({ length: 4 }, (_, i) => {
        const date = new Date(now)
        date.setDate(date.getDate() - (i * 7))
        return {
          week: `Week ${4 - i}`,
          views: Math.floor(Math.random() * 5000) + 2000
        }
      }),
      monthly: Array.from({ length: 12 }, (_, i) => {
        const date = new Date(now)
        date.setMonth(date.getMonth() - i)
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          views: Math.floor(Math.random() * 20000) + 10000
        }
      }).reverse()
    }
  }

  // Analytics tracking methods
  trackPageView(url: string, userAgent?: string): void {
    const metrics = this.metrics.get(url)
    if (metrics) {
      metrics.views++
      metrics.lastUpdated = new Date()
      
      // Update device breakdown based on user agent
      if (userAgent) {
        const location = this.getLocationFromUrl(url)
        if (location) {
          const analytics = this.locationAnalytics.get(location)
          if (analytics) {
            if (userAgent.includes('Mobile')) {
              analytics.deviceBreakdown.mobile++
            } else if (userAgent.includes('Tablet')) {
              analytics.deviceBreakdown.tablet++
            } else {
              analytics.deviceBreakdown.desktop++
            }
          }
        }
      }
    }
  }

  trackConversion(url: string): void {
    const metrics = this.metrics.get(url)
    if (metrics) {
      // Update conversion rate calculation
      metrics.conversionRate = (metrics.conversionRate * metrics.views + 1) / (metrics.views + 1)
    }
  }

  trackSocialShare(url: string): void {
    const metrics = this.metrics.get(url)
    if (metrics) {
      metrics.socialShares++
    }
  }

  private getLocationFromUrl(url: string): string | null {
    // Extract location from URL pattern /golden-hour/location-slug
    const match = url.match(/\/golden-hour\/([^/?]+)/)
    if (match) {
      const slug = match[1]
      const location = locationDatabase.getAllLocations().find(loc => loc.urlSlug === slug)
      return location?.name || null
    }
    return null
  }

  // Export data methods
  exportMetricsToCSV(): string {
    const metrics = this.getAllMetrics()
    const headers = [
      'URL', 'Views', 'Unique Visitors', 'Bounce Rate', 'Avg Session Duration',
      'Conversion Rate', 'SEO Score', 'Load Time', 'Mobile Optimization',
      'Social Shares', 'Backlinks', 'Search Ranking', 'CTR'
    ]
    
    const rows = metrics.map(m => [
      m.url, m.views, m.uniqueVisitors, m.bounceRate.toFixed(2),
      m.avgSessionDuration.toFixed(0), m.conversionRate.toFixed(3),
      m.seoScore, m.loadTime.toFixed(1), m.mobileOptimization.toFixed(0),
      m.socialShares, m.backlinks, m.searchRanking, m.clickThroughRate.toFixed(3)
    ])
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  exportLocationAnalyticsToJSON(): string {
    return JSON.stringify(this.getAllLocationAnalytics(), null, 2)
  }
}

// Singleton instance
export const urlAnalytics = new URLAnalytics()
