import { generateLocationSlug, generateSEOFriendlyURL, type LocationParams } from './url-utils'
import { seoOptimizer, type LocationSEOData } from './seo-optimizer'
import { locationDatabase, type LocationEntry } from './location-database'

// Popular photography destinations with their coordinates
export const POPULAR_LOCATIONS = [
  // Major Cities
  { name: 'New York', country: 'USA', state: 'NY', lat: 40.7128, lng: -74.0060, timezone: 'America/New_York' },
  { name: 'Los Angeles', country: 'USA', state: 'CA', lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles' },
  { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London' },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'Sydney', country: 'Australia', state: 'NSW', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai' },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, timezone: 'Asia/Singapore' },
  { name: 'Hong Kong', country: 'China', lat: 22.3193, lng: 114.1694, timezone: 'Asia/Hong_Kong' },
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734, timezone: 'Europe/Madrid' },
  
  // Photography Hotspots
  { name: 'Santorini', country: 'Greece', lat: 36.3932, lng: 25.4615, timezone: 'Europe/Athens' },
  { name: 'Bali', country: 'Indonesia', lat: -8.3405, lng: 115.0920, timezone: 'Asia/Makassar' },
  { name: 'Reykjavik', country: 'Iceland', lat: 64.1466, lng: -21.9426, timezone: 'Atlantic/Reykjavik' },
  { name: 'Banff', country: 'Canada', state: 'AB', lat: 51.1784, lng: -115.5708, timezone: 'America/Edmonton' },
  { name: 'Yosemite', country: 'USA', state: 'CA', lat: 37.8651, lng: -119.5383, timezone: 'America/Los_Angeles' },
  { name: 'Machu Picchu', country: 'Peru', lat: -13.1631, lng: -72.5450, timezone: 'America/Lima' },
  { name: 'Petra', country: 'Jordan', lat: 30.3285, lng: 35.4444, timezone: 'Asia/Amman' },
  { name: 'Taj Mahal', country: 'India', lat: 27.1751, lng: 78.0421, timezone: 'Asia/Kolkata' },
  { name: 'Grand Canyon', country: 'USA', state: 'AZ', lat: 36.1069, lng: -112.1129, timezone: 'America/Phoenix' },
  { name: 'Milford Sound', country: 'New Zealand', lat: -44.6700, lng: 167.9250, timezone: 'Pacific/Auckland' },
  
  // Coastal Cities
  { name: 'Miami', country: 'USA', state: 'FL', lat: 25.7617, lng: -80.1918, timezone: 'America/New_York' },
  { name: 'San Francisco', country: 'USA', state: 'CA', lat: 37.7749, lng: -122.4194, timezone: 'America/Los_Angeles' },
  { name: 'Venice', country: 'Italy', lat: 45.4408, lng: 12.3155, timezone: 'Europe/Rome' },
  { name: 'Nice', country: 'France', lat: 43.7102, lng: 7.2620, timezone: 'Europe/Paris' },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729, timezone: 'America/Sao_Paulo' },
  { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lng: 18.4241, timezone: 'Africa/Johannesburg' },
  { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393, timezone: 'Europe/Lisbon' },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, timezone: 'Europe/Istanbul' },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, timezone: 'Asia/Kolkata' },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, timezone: 'Asia/Bangkok' }
] as const

interface URLGenerationOptions {
  includeDate?: boolean
  dateRange?: { start: Date; end: Date }
  format?: 'seo' | 'coordinates' | 'both'
  includePopularOnly?: boolean
  customLocations?: Array<{ name: string; lat: number; lng: number; country?: string; state?: string }>
}

interface URLAnalytics {
  url: string
  location: string
  coordinates: string
  estimatedTraffic: 'high' | 'medium' | 'low'
  seoScore: number
  keywords: string[]
  competitionLevel: 'high' | 'medium' | 'low'
}

interface SitemapEntry {
  url: string
  lastmod: string
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly'
  priority: string
  alternates?: Array<{ hreflang: string; href: string }>
}

class IntelligentURLManager {
  private baseUrl: string
  private popularLocations: typeof POPULAR_LOCATIONS

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
    this.popularLocations = POPULAR_LOCATIONS
  }

  /**
   * Generate URLs for all popular locations
   */
  generatePopularLocationURLs(options: URLGenerationOptions = {}): string[] {
    const { includeDate = false, format = 'seo', dateRange } = options
    const urls: string[] = []

    const locations = options.includePopularOnly !== false ? this.popularLocations : []
    const customLocations = options.customLocations || []
    const allLocations = [...locations, ...customLocations]

    // Also include locations from the database
    const dbLocations = locationDatabase.getPopularLocations(50)
    const dbLocationParams = dbLocations.map(loc => ({
      lat: loc.coordinates.lat,
      lng: loc.coordinates.lng,
      name: loc.name
    }))

    const combinedLocations = [...allLocations, ...dbLocationParams]

    for (const location of combinedLocations) {
      const params: LocationParams = {
        lat: location.lat,
        lng: location.lng,
        locationName: location.name
      }

      if (includeDate && dateRange) {
        // Generate URLs for date range
        const dates = this.generateDateRange(dateRange.start, dateRange.end)
        for (const date of dates) {
          params.date = date
          urls.push(this.generateURL(params, format))
        }
      } else if (includeDate) {
        // Generate URL for today
        params.date = new Date().toISOString().split('T')[0]
        urls.push(this.generateURL(params, format))
      } else {
        urls.push(this.generateURL(params, format))
      }
    }

    return urls
  }

  /**
   * Generate URL for a specific location
   */
  generateURL(params: LocationParams, format: 'seo' | 'coordinates' | 'both' = 'seo'): string {
    const baseURL = this.baseUrl
    
    switch (format) {
      case 'seo':
        return `${baseURL}${generateSEOFriendlyURL(params)}`
      case 'coordinates':
        return `${baseURL}/golden-hour/coordinates/${params.lat.toFixed(4)},${params.lng.toFixed(4)}${params.date ? `/${params.date}` : ''}`
      case 'both':
        return {
          seo: `${baseURL}${generateSEOFriendlyURL(params)}`,
          coordinates: `${baseURL}/golden-hour/coordinates/${params.lat.toFixed(4)},${params.lng.toFixed(4)}${params.date ? `/${params.date}` : ''}`
        } as any
      default:
        return `${baseURL}${generateSEOFriendlyURL(params)}`
    }
  }

  /**
   * Generate comprehensive sitemap for all locations
   */
  generateSitemap(options: URLGenerationOptions = {}): SitemapEntry[] {
    const urls = this.generatePopularLocationURLs(options)
    const entries: SitemapEntry[] = []
    const now = new Date().toISOString().split('T')[0]

    // Add homepage
    entries.push({
      url: `${this.baseUrl}/`,
      lastmod: now,
      changefreq: 'daily',
      priority: '1.0'
    })

    // Add location URLs
    for (const url of urls) {
      const priority = this.calculateURLPriority(url)
      entries.push({
        url,
        lastmod: now,
        changefreq: 'weekly',
        priority: priority.toString()
      })
    }

    return entries
  }

  /**
   * Generate XML sitemap
   */
  generateXMLSitemap(options: URLGenerationOptions = {}): string {
    const entries = this.generateSitemap(options)
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for (const entry of entries) {
      xml += '  <url>\n'
      xml += `    <loc>${this.escapeXML(entry.url)}</loc>\n`
      xml += `    <lastmod>${entry.lastmod}</lastmod>\n`
      xml += `    <changefreq>${entry.changefreq}</changefreq>\n`
      xml += `    <priority>${entry.priority}</priority>\n`
      xml += '  </url>\n'
    }
    
    xml += '</urlset>'
    return xml
  }

  /**
   * Analyze URL performance and SEO potential
   */
  analyzeURLs(urls: string[]): URLAnalytics[] {
    return urls.map(url => this.analyzeURL(url))
  }

  /**
   * Analyze individual URL
   */
  analyzeURL(url: string): URLAnalytics {
    const location = this.extractLocationFromURL(url)
    const coordinates = this.extractCoordinatesFromURL(url)
    
    // Try to get enhanced data from location database
     const dbLocation = location ? locationDatabase.searchLocations(location, 1)[0] : null
    
    const seoScore = dbLocation ? dbLocation.seoScore : this.calculateSEOScore(url)
    const keywords = dbLocation ? dbLocation.keywords : this.generateKeywords(location)
    const estimatedTraffic = dbLocation ? dbLocation.estimatedTraffic : this.estimateTraffic(location)
    const competitionLevel = dbLocation ? dbLocation.competitionLevel : this.assessCompetition(location)
    
    return {
      url,
      location: location || 'Unknown',
      coordinates: coordinates || 'Unknown',
      estimatedTraffic,
      seoScore,
      keywords,
      competitionLevel
    }
  }

  /**
   * Generate URL redirects for common variations
   */
  generateRedirects(): Array<{ from: string; to: string; type: number }> {
    const redirects: Array<{ from: string; to: string; type: number }> = []

    for (const location of this.popularLocations) {
      const canonicalURL = this.generateURL({
        lat: location.lat,
        lng: location.lng,
        locationName: location.name
      })

      // Common variations
      const variations = [
        location.name.toLowerCase().replace(/\s+/g, '-'),
        location.name.toLowerCase().replace(/\s+/g, '_'),
        location.name.toLowerCase().replace(/\s+/g, ''),
        generateLocationSlug(location.name)
      ]

      for (const variation of variations) {
        if (variation !== generateLocationSlug(location.name)) {
          redirects.push({
            from: `/golden-hour/${variation}`,
            to: canonicalURL,
            type: 301
          })
        }
      }
    }

    return redirects
  }

  /**
   * Get location suggestions based on partial input
   */
  getLocationSuggestions(query: string, limit: number = 10): Array<{
    name: string
    country: string
    state?: string
    coordinates: { lat: number; lng: number }
    url: string
  }> {
    // Use location database for enhanced search
    const dbSuggestions = locationDatabase.searchLocations(query, limit)
    
    if (dbSuggestions.length > 0) {
      return dbSuggestions.map(location => ({
        name: location.name,
        country: location.country,
        state: location.state,
        coordinates: location.coordinates,
        url: this.generateURL({
          lat: location.coordinates.lat,
          lng: location.coordinates.lng,
          locationName: location.name
        })
      }))
    }

    // Fallback to popular locations
    const normalizedQuery = query.toLowerCase()
    
    return this.popularLocations
      .filter(location => 
        location.name.toLowerCase().includes(normalizedQuery) ||
        location.country.toLowerCase().includes(normalizedQuery) ||
        ('state' in location && location.state && location.state.toLowerCase().includes(normalizedQuery))
      )
      .slice(0, limit)
      .map(location => ({
        name: location.name,
        country: location.country,
        state: 'state' in location ? location.state : undefined,
        coordinates: { lat: location.lat, lng: location.lng },
        url: this.generateURL({
          lat: location.lat,
          lng: location.lng,
          locationName: location.name
        })
      }))
  }

  /**
   * Generate robots.txt with sitemap reference
   */
  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

Sitemap: ${this.baseUrl}/sitemap.xml
Sitemap: ${this.baseUrl}/sitemap-locations.xml

# Optimize crawl budget
Crawl-delay: 1

# Block unnecessary paths
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /test/`
  }

  // Private helper methods
  private generateDateRange(start: Date, end: Date): string[] {
    const dates: string[] = []
    const current = new Date(start)
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }

  private calculateURLPriority(url: string): number {
    const location = this.extractLocationFromURL(url)
    const isPopular = this.popularLocations.some(loc => 
      url.includes(generateLocationSlug(loc.name))
    )
    
    if (url === `${this.baseUrl}/`) return 1.0
    if (isPopular) return 0.8
    if (location) return 0.6
    return 0.4
  }

  private extractLocationFromURL(url: string): string | null {
    const match = url.match(/\/golden-hour\/([^/]+)/)
    if (!match) return null
    
    const slug = match[1]
    if (slug === 'coordinates') return null
    
    return slug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  private extractCoordinatesFromURL(url: string): string | null {
    const coordMatch = url.match(/(-?\d+\.\d+),(-?\d+\.\d+)/)
    return coordMatch ? `${coordMatch[1]},${coordMatch[2]}` : null
  }

  private calculateSEOScore(url: string): number {
    let score = 50 // Base score
    
    // URL structure
    if (url.includes('/golden-hour/')) score += 20
    if (url.match(/\/golden-hour\/[a-z-]+\/\d+\.\d+,\d+\.\d+/)) score += 15
    if (url.length < 100) score += 10
    if (!url.includes('coordinates')) score += 5
    
    return Math.min(100, score)
  }

  private generateKeywords(location: string | null): string[] {
    const baseKeywords = ['golden hour', 'sunrise', 'sunset', 'photography', 'magic hour']
    
    if (location) {
      return [
        ...baseKeywords,
        location.toLowerCase(),
        `${location.toLowerCase()} golden hour`,
        `${location.toLowerCase()} sunrise`,
        `${location.toLowerCase()} sunset`,
        `${location.toLowerCase()} photography`
      ]
    }
    
    return baseKeywords
  }

  private estimateTraffic(location: string | null): 'high' | 'medium' | 'low' {
    if (!location) return 'low'
    
    const highTrafficCities = ['new york', 'london', 'paris', 'tokyo', 'los angeles']
    const mediumTrafficCities = ['sydney', 'barcelona', 'dubai', 'singapore', 'miami']
    
    const locationLower = location.toLowerCase()
    
    if (highTrafficCities.some(city => locationLower.includes(city))) return 'high'
    if (mediumTrafficCities.some(city => locationLower.includes(city))) return 'medium'
    
    return 'low'
  }

  private assessCompetition(location: string | null): 'high' | 'medium' | 'low' {
    if (!location) return 'low'
    
    const highCompetitionCities = ['new york', 'london', 'paris', 'tokyo']
    const locationLower = location.toLowerCase()
    
    if (highCompetitionCities.some(city => locationLower.includes(city))) return 'high'
    
    return 'medium'
  }

  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
}

// Export singleton instance
export const intelligentURLManager = new IntelligentURLManager()
export { IntelligentURLManager }
export type { URLGenerationOptions, URLAnalytics, SitemapEntry }
