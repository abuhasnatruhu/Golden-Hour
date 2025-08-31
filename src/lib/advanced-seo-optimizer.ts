import { LocationData } from './location-service'
import { locationDatabase, LocationEntry } from './location-database'
import { generateSEOFriendlyURL, formatDateForURL } from './url-utils'

export interface AdvancedSEOConfig {
  includeDate?: boolean
  includeCoordinates?: boolean
  includeTimezone?: boolean
  includeWeather?: boolean
  customKeywords?: string[]
  targetAudience?: 'photographers' | 'travelers' | 'general'
  contentType?: 'golden-hour' | 'blue-hour' | 'sunrise' | 'sunset' | 'general'
  languageCode?: string
  regionCode?: string
}

export interface SEOMetadata {
  title: string
  description: string
  keywords: string[]
  canonicalUrl: string
  alternateUrls?: { [key: string]: string }
  openGraph: {
    title: string
    description: string
    type: string
    url: string
    image?: string
    siteName: string
    locale: string
  }
  twitter: {
    card: string
    title: string
    description: string
    image?: string
    creator?: string
  }
  structuredData: {
    '@context': string
    '@type': string
    name: string
    description: string
    url: string
    geo?: {
      '@type': string
      latitude: number
      longitude: number
    }
    address?: {
      '@type': string
      addressLocality: string
      addressCountry: string
      addressRegion?: string
    }
    offers?: {
      '@type': string
      price: string
      priceCurrency: string
      availability: string
    }
    aggregateRating?: {
      '@type': string
      ratingValue: number
      reviewCount: number
    }
  }
  breadcrumbs: Array<{
    name: string
    url: string
  }>
  hreflang?: { [key: string]: string }
  robots: string
  viewport: string
  themeColor: string
}

export interface URLOptimizationResult {
  originalUrl: string
  optimizedUrl: string
  seoScore: number
  improvements: string[]
  warnings: string[]
  metadata: SEOMetadata
  performance: {
    loadTime: number
    sizeKB: number
    compressionRatio: number
  }
}

export class AdvancedSEOOptimizer {
  private readonly baseUrl: string
  private readonly siteName: string
  private readonly defaultImage: string
  private readonly twitterHandle: string

  constructor(
    baseUrl: string = 'https://goldenhourcalculator.com',
    siteName: string = 'Golden Hour Calculator',
    defaultImage: string = '/images/golden-hour-og.jpg',
    twitterHandle: string = '@goldenhourcalc'
  ) {
    this.baseUrl = baseUrl
    this.siteName = siteName
    this.defaultImage = defaultImage
    this.twitterHandle = twitterHandle
  }

  /**
   * Generate optimized SEO metadata for a location
   */
  generateOptimizedMetadata(
    location: LocationData | LocationEntry,
    config: AdvancedSEOConfig = {},
    date?: Date
  ): SEOMetadata {
    const locationName = this.getLocationName(location)
    const coordinates = this.getCoordinates(location)
    const country = this.getCountry(location)
    const region = this.getRegion(location)
    
    // Generate base URL
    const urlSlug = this.isLocationEntry(location) 
      ? location.urlSlug 
      : generateSEOFriendlyURL({ 
           lat: this.isLocationEntry(location) ? location.coordinates.lat : location.lat, 
           lng: this.isLocationEntry(location) ? location.coordinates.lng : location.lon, 
           locationName 
         })
    
    let canonicalUrl = `${this.baseUrl}/golden-hour/${urlSlug}`
    
    if (config.includeDate && date) {
      canonicalUrl += `/${formatDateForURL(date)}`
    }

    // Generate title with variations based on content type
    const title = this.generateTitle(locationName, country, config, date)
    
    // Generate description
    const description = this.generateDescription(locationName, country, config, date)
    
    // Generate keywords
    const keywords = this.generateKeywords(location, config)
    
    // Generate structured data
    const structuredData = this.generateStructuredData(location, canonicalUrl, title, description)
    
    // Generate breadcrumbs
    const breadcrumbs = this.generateBreadcrumbs(location, locationName, country, region)
    
    // Generate Open Graph data
    const openGraph = {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      image: this.generateImageUrl(location, config),
      siteName: this.siteName,
      locale: config.languageCode || 'en_US'
    }
    
    // Generate Twitter Card data
    const twitter = {
      card: 'summary_large_image',
      title,
      description,
      image: this.generateImageUrl(location, config),
      creator: this.twitterHandle
    }
    
    // Generate hreflang if multiple languages
    const hreflang = this.generateHreflang(canonicalUrl, config)
    
    return {
      title,
      description,
      keywords,
      canonicalUrl,
      alternateUrls: this.generateAlternateUrls(location, config),
      openGraph,
      twitter,
      structuredData,
      breadcrumbs,
      hreflang,
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      viewport: 'width=device-width, initial-scale=1',
      themeColor: '#f59e0b'
    }
  }

  /**
   * Optimize an existing URL structure
   */
  optimizeURL(
    originalUrl: string,
    location?: LocationData | LocationEntry,
    config: AdvancedSEOConfig = {}
  ): URLOptimizationResult {
    const improvements: string[] = []
    const warnings: string[] = []
    let seoScore = 0
    
    // Analyze original URL
    const urlAnalysis = this.analyzeURL(originalUrl)
    seoScore += urlAnalysis.score
    improvements.push(...urlAnalysis.improvements)
    warnings.push(...urlAnalysis.warnings)
    
    // Generate optimized URL
    let optimizedUrl = originalUrl
    
    if (location) {
      const locationName = this.getLocationName(location)
      const country = this.getCountry(location)
      const urlSlug = generateSEOFriendlyURL({ 
           lat: this.isLocationEntry(location) ? location.coordinates.lat : location.lat, 
           lng: this.isLocationEntry(location) ? location.coordinates.lng : location.lon, 
           locationName 
         })
      
      optimizedUrl = `/golden-hour/${urlSlug}`
      
      if (config.includeDate) {
        const date = this.extractDateFromUrl(originalUrl) || new Date()
        optimizedUrl += `/${formatDateForURL(date)}`
      }
      
      improvements.push('Generated SEO-friendly URL slug')
      seoScore += 20
    }
    
    // Generate metadata
    const metadata = location 
      ? this.generateOptimizedMetadata(location, config)
      : this.generateFallbackMetadata(originalUrl)
    
    // Calculate performance metrics
    const performance = this.calculatePerformanceMetrics(optimizedUrl, metadata)
    
    // Final SEO score calculation
    seoScore = Math.min(100, seoScore + this.calculateMetadataScore(metadata))
    
    return {
      originalUrl,
      optimizedUrl,
      seoScore,
      improvements,
      warnings,
      metadata,
      performance
    }
  }

  /**
   * Generate bulk optimized URLs for multiple locations
   */
  generateBulkOptimizedUrls(
    locations: (LocationData | LocationEntry)[],
    config: AdvancedSEOConfig = {},
    dates?: Date[]
  ): URLOptimizationResult[] {
    return locations.map((location, index) => {
      const date = dates?.[index]
      const locationConfig = { ...config, includeDate: !!date }
      
      const locationName = this.getLocationName(location)
      const country = this.getCountry(location)
      const urlSlug = this.isLocationEntry(location) 
        ? location.urlSlug 
        : generateSEOFriendlyURL({ 
             lat: this.isLocationEntry(location) ? location.coordinates.lat : location.lat, 
             lng: this.isLocationEntry(location) ? location.coordinates.lng : location.lon, 
             locationName 
           })
      
      let originalUrl = `/golden-hour/${urlSlug}`
      if (date) {
        originalUrl += `/${formatDateForURL(date)}`
      }
      
      return this.optimizeURL(originalUrl, location, locationConfig)
    })
  }

  /**
   * Generate sitemap with optimized URLs
   */
  generateOptimizedSitemap(
    locations?: (LocationData | LocationEntry)[],
    config: AdvancedSEOConfig = {}
  ): string {
    const locs = locations || locationDatabase.getPopularLocations(100)
    const urls: string[] = []
    
    // Add homepage
    urls.push(`  <url>`)
    urls.push(`    <loc>${this.baseUrl}</loc>`)
    urls.push(`    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`)
    urls.push(`    <changefreq>daily</changefreq>`)
    urls.push(`    <priority>1.0</priority>`)
    urls.push(`  </url>`)
    
    // Add location URLs
    locs.forEach(location => {
      const locationName = this.getLocationName(location)
      const country = this.getCountry(location)
      const urlSlug = this.isLocationEntry(location) 
        ? location.urlSlug 
        : generateSEOFriendlyURL({ 
             lat: this.isLocationEntry(location) ? location.coordinates.lat : location.lat, 
             lng: this.isLocationEntry(location) ? location.coordinates.lng : location.lon, 
             locationName 
           })
      
      const url = `${this.baseUrl}/golden-hour/${urlSlug}`
      const priority = this.calculateUrlPriority(location)
      
      urls.push(`  <url>`)
      urls.push(`    <loc>${url}</loc>`)
      urls.push(`    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`)
      urls.push(`    <changefreq>weekly</changefreq>`)
      urls.push(`    <priority>${priority}</priority>`)
      
      // Add image sitemap data if available
      const imageUrl = this.generateImageUrl(location, config)
      if (imageUrl) {
        urls.push(`    <image:image>`)
        urls.push(`      <image:loc>${imageUrl}</image:loc>`)
        urls.push(`      <image:title>Golden Hour in ${locationName}</image:title>`)
        urls.push(`      <image:caption>Golden hour times and photography tips for ${locationName}, ${country}</image:caption>`)
        urls.push(`    </image:image>`)
      }
      
      urls.push(`  </url>`)
    })
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`
  }

  /**
   * Generate robots.txt with optimized directives
   */
  generateOptimizedRobotsTxt(): string {
    return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${this.baseUrl}/sitemap.xml
Sitemap: ${this.baseUrl}/image-sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Disallow admin and API endpoints
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Allow important static assets
Allow: /images/
Allow: /icons/
Allow: /*.css$
Allow: /*.js$

# Host directive
Host: ${this.baseUrl}`
  }

  // Private helper methods
  private getLocationName(location: LocationData | LocationEntry): string {
    if (this.isLocationEntry(location)) {
      return location.name
    }
    return location.city
  }

  private getCoordinates(location: LocationData | LocationEntry): { lat: number; lng: number } {
    if (this.isLocationEntry(location)) {
      return location.coordinates
    }
    return { lat: location.lat, lng: location.lon }
  }

  private getCountry(location: LocationData | LocationEntry): string {
    return location.country
  }

  private getRegion(location: LocationData | LocationEntry): string | undefined {
    if (this.isLocationEntry(location)) {
      return location.region
    }
    return location.state || location.region
  }

  private isLocationEntry(location: LocationData | LocationEntry): location is LocationEntry {
    return 'urlSlug' in location
  }

  private generateTitle(
    locationName: string,
    country: string,
    config: AdvancedSEOConfig,
    date?: Date
  ): string {
    const baseTitle = `Golden Hour Times in ${locationName}, ${country}`
    
    if (config.contentType === 'sunrise') {
      return `Sunrise Times in ${locationName}, ${country} | Golden Hour Calculator`
    }
    
    if (config.contentType === 'sunset') {
      return `Sunset Times in ${locationName}, ${country} | Golden Hour Calculator`
    }
    
    if (config.contentType === 'blue-hour') {
      return `Blue Hour Times in ${locationName}, ${country} | Photography Guide`
    }
    
    if (date) {
      const dateStr = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      return `${baseTitle} - ${dateStr} | Golden Hour Calculator`
    }
    
    return `${baseTitle} | Golden Hour Calculator`
  }

  private generateDescription(
    locationName: string,
    country: string,
    config: AdvancedSEOConfig,
    date?: Date
  ): string {
    const baseDesc = `Find the perfect golden hour times for photography in ${locationName}, ${country}.`
    
    if (config.targetAudience === 'photographers') {
      return `${baseDesc} Get precise sunrise, sunset, and golden hour times with photography tips and optimal shooting conditions.`
    }
    
    if (config.targetAudience === 'travelers') {
      return `${baseDesc} Plan your visit with accurate sunrise and sunset times for the best travel photography opportunities.`
    }
    
    if (date) {
      const dateStr = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      return `${baseDesc} Golden hour times for ${dateStr} with weather conditions and photography recommendations.`
    }
    
    return `${baseDesc} Calculate sunrise, sunset, and optimal photography times with our free golden hour calculator.`
  }

  private generateKeywords(
    location: LocationData | LocationEntry,
    config: AdvancedSEOConfig
  ): string[] {
    const locationName = this.getLocationName(location)
    const country = this.getCountry(location)
    
    const baseKeywords = [
      `golden hour ${locationName}`,
      `sunrise ${locationName}`,
      `sunset ${locationName}`,
      `photography ${locationName}`,
      `golden hour times ${country}`,
      'golden hour calculator',
      'photography times',
      'sunrise sunset times'
    ]
    
    if (config.customKeywords) {
      baseKeywords.push(...config.customKeywords)
    }
    
    if (config.contentType) {
      baseKeywords.push(`${config.contentType} ${locationName}`)
    }
    
    if (this.isLocationEntry(location) && location.keywords) {
      baseKeywords.push(...location.keywords)
    }
    
    return [...new Set(baseKeywords)].slice(0, 15) // Limit to 15 keywords
  }

  private generateStructuredData(
    location: LocationData | LocationEntry,
    url: string,
    title: string,
    description: string
  ): SEOMetadata['structuredData'] {
    const locationName = this.getLocationName(location)
    const country = this.getCountry(location)
    const coordinates = this.getCoordinates(location)
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: locationName,
      description,
      url,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: coordinates.lat,
        longitude: coordinates.lng
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: locationName,
        addressCountry: country,
        addressRegion: this.getRegion(location)
      }
    }
  }

  private generateBreadcrumbs(
    location: LocationData | LocationEntry,
    locationName: string,
    country: string,
    region?: string
  ): Array<{ name: string; url: string }> {
    const breadcrumbs = [
      { name: 'Home', url: this.baseUrl },
      { name: 'Golden Hour Calculator', url: `${this.baseUrl}/golden-hour` }
    ]
    
    if (region && region !== country) {
      breadcrumbs.push({ 
        name: region, 
        url: `${this.baseUrl}/golden-hour/${generateSEOFriendlyURL({ 
            lat: this.isLocationEntry(location) ? location.coordinates.lat : location.lat, 
            lng: this.isLocationEntry(location) ? location.coordinates.lng : location.lon, 
            locationName: region 
          })}` 
      })
    }
    
    breadcrumbs.push({ 
      name: locationName, 
      url: `${this.baseUrl}/golden-hour/${generateSEOFriendlyURL({ 
          lat: this.isLocationEntry(location) ? location.coordinates.lat : location.lat, 
          lng: this.isLocationEntry(location) ? location.coordinates.lng : location.lon, 
          locationName 
        })}` 
    })
    
    return breadcrumbs
  }

  private generateImageUrl(
    location: LocationData | LocationEntry,
    config: AdvancedSEOConfig
  ): string {
    const locationName = this.getLocationName(location)
    const coordinates = this.getCoordinates(location)
    
    // Generate dynamic image URL based on location
    return `${this.baseUrl}/api/images/golden-hour?location=${encodeURIComponent(locationName)}&lat=${coordinates.lat}&lng=${coordinates.lng}&type=${config.contentType || 'golden-hour'}`
  }

  private generateHreflang(
    canonicalUrl: string,
    config: AdvancedSEOConfig
  ): { [key: string]: string } | undefined {
    if (!config.languageCode || config.languageCode === 'en') {
      return undefined
    }
    
    return {
      'en': canonicalUrl.replace(`/${config.languageCode}/`, '/'),
      [config.languageCode]: canonicalUrl
    }
  }

  private generateAlternateUrls(
    location: LocationData | LocationEntry,
    config: AdvancedSEOConfig
  ): { [key: string]: string } | undefined {
    const locationName = this.getLocationName(location)
    const country = this.getCountry(location)
    const coordinates = this.getCoordinates(location)
    
    return {
      'coordinates': `${this.baseUrl}/golden-hour/${coordinates.lat},${coordinates.lng}`,
      'short': `${this.baseUrl}/gh/${generateSEOFriendlyURL({ 
          lat: this.isLocationEntry(location) ? location.coordinates.lat : location.lat, 
          lng: this.isLocationEntry(location) ? location.coordinates.lng : location.lon, 
          locationName 
        })}`,
      'api': `${this.baseUrl}/api/golden-hour?location=${encodeURIComponent(locationName)}`
    }
  }

  private analyzeURL(url: string): { score: number; improvements: string[]; warnings: string[] } {
    const improvements: string[] = []
    const warnings: string[] = []
    let score = 0
    
    // Check URL length
    if (url.length > 100) {
      warnings.push('URL is too long (>100 characters)')
    } else if (url.length < 50) {
      score += 10
      improvements.push('URL length is optimal')
    }
    
    // Check for hyphens vs underscores
    if (url.includes('_')) {
      warnings.push('Use hyphens instead of underscores in URLs')
    } else if (url.includes('-')) {
      score += 5
      improvements.push('Uses SEO-friendly hyphens')
    }
    
    // Check for lowercase
    if (url === url.toLowerCase()) {
      score += 5
      improvements.push('URL is lowercase')
    } else {
      warnings.push('URL should be lowercase')
    }
    
    // Check for special characters
    if (!/^[a-z0-9\-\/\.,]+$/i.test(url)) {
      warnings.push('URL contains special characters')
    } else {
      score += 5
      improvements.push('URL uses only safe characters')
    }
    
    return { score, improvements, warnings }
  }

  private calculateUrlPriority(location: LocationData | LocationEntry): string {
    if (this.isLocationEntry(location)) {
      // Use SEO score or population to determine priority
      const seoScore = location.seoScore || 50
      if (seoScore >= 80) return '0.9'
      if (seoScore >= 60) return '0.7'
      return '0.5'
    }
    
    // Default priority for LocationData
    return '0.6'
  }

  private calculatePerformanceMetrics(
    url: string,
    metadata: SEOMetadata
  ): URLOptimizationResult['performance'] {
    // Simulate performance metrics
    const metadataSize = JSON.stringify(metadata).length
    
    return {
      loadTime: Math.max(100, Math.min(2000, metadataSize / 10)), // Simulated load time
      sizeKB: Math.round(metadataSize / 1024 * 100) / 100,
      compressionRatio: 0.7 // Assume 70% compression
    }
  }

  private calculateMetadataScore(metadata: SEOMetadata): number {
    let score = 0
    
    // Title optimization
    if (metadata.title.length >= 30 && metadata.title.length <= 60) score += 10
    if (metadata.title.includes('Golden Hour')) score += 5
    
    // Description optimization
    if (metadata.description.length >= 120 && metadata.description.length <= 160) score += 10
    
    // Keywords
    if (metadata.keywords.length >= 5 && metadata.keywords.length <= 15) score += 5
    
    // Structured data
    if (metadata.structuredData) score += 15
    
    // Open Graph
    if (metadata.openGraph.image) score += 10
    
    // Breadcrumbs
    if (metadata.breadcrumbs.length >= 2) score += 5
    
    return score
  }

  private generateFallbackMetadata(url: string): SEOMetadata {
    return {
      title: 'Golden Hour Calculator',
      description: 'Calculate golden hour times for photography worldwide',
      keywords: ['golden hour', 'photography', 'sunrise', 'sunset'],
      canonicalUrl: `${this.baseUrl}${url}`,
      openGraph: {
        title: 'Golden Hour Calculator',
        description: 'Calculate golden hour times for photography worldwide',
        type: 'website',
        url: `${this.baseUrl}${url}`,
        siteName: this.siteName,
        locale: 'en_US'
      },
      twitter: {
        card: 'summary',
        title: 'Golden Hour Calculator',
        description: 'Calculate golden hour times for photography worldwide'
      },
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Golden Hour Calculator',
        description: 'Calculate golden hour times for photography worldwide',
        url: `${this.baseUrl}${url}`
      },
      breadcrumbs: [
        { name: 'Home', url: this.baseUrl }
      ],
      robots: 'index, follow',
      viewport: 'width=device-width, initial-scale=1',
      themeColor: '#f59e0b'
    }
  }

  private extractDateFromUrl(url: string): Date | null {
    const dateMatch = url.match(/\/(\d{4}-\d{2}-\d{2})$/)
    if (dateMatch) {
      return new Date(dateMatch[1])
    }
    return null
  }
}

// Export singleton instance
export const advancedSEOOptimizer = new AdvancedSEOOptimizer()
