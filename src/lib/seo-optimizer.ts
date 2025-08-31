interface SEOMetadata {
  title: string
  description: string
  keywords: string[]
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  structuredData?: any
}

interface LocationSEOData {
  city: string
  country: string
  state?: string
  region?: string
  timezone?: string
  coordinates?: {
    lat: number
    lon: number
  }
}

class SEOOptimizer {
  private baseUrl: string
  private siteName: string
  private defaultImage: string

  constructor(baseUrl: string = '', siteName: string = 'Golden Hour Calculator', defaultImage: string = '/og-image.jpg') {
    this.baseUrl = baseUrl
    this.siteName = siteName
    this.defaultImage = defaultImage
  }

  generateLocationSEO(locationData: LocationSEOData, currentTime?: Date): SEOMetadata {
    const { city, country, state, region, timezone, coordinates } = locationData
    const time = currentTime || new Date()
    
    // Generate location-specific content
    const locationString = this.formatLocationString(city, state || region, country)
    const timeString = timezone ? time.toLocaleString('en-US', { timeZone: timezone }) : time.toLocaleString()
    
    // Generate title variations
    const titles = [
      `Golden Hour Times in ${locationString} - Sunrise & Sunset Calculator`,
      `${locationString} Golden Hour Calculator - Photography Light Times`,
      `Sunrise, Sunset & Golden Hour Times for ${locationString}`,
      `Photography Golden Hour in ${locationString} - Light Calculator`
    ]
    
    const title = titles[0] // Use first as primary
    
    // Generate descriptions
    const descriptions = [
      `Calculate precise golden hour, sunrise, and sunset times for ${locationString}. Perfect for photographers and outdoor enthusiasts. Current local time: ${timeString}.`,
      `Find the best photography lighting times in ${locationString}. Get accurate golden hour, blue hour, sunrise and sunset calculations for your location.`,
      `Professional golden hour calculator for ${locationString}. Plan your photography sessions with precise sunrise, sunset, and magic hour times.`
    ]
    
    const description = descriptions[0]
    
    // Generate keywords
    const keywords = [
      'golden hour',
      'sunrise',
      'sunset',
      'photography',
      'magic hour',
      'blue hour',
      city.toLowerCase(),
      country.toLowerCase(),
      'calculator',
      'times',
      'lighting',
      'photographer',
      'outdoor photography',
      'landscape photography'
    ]
    
    if (state) {
      keywords.push(state.toLowerCase())
    }
    
    // Generate structured data
    const structuredData = this.generateStructuredData(locationData, time)
    
    // Generate canonical URL
    const canonicalUrl = this.generateCanonicalUrl(locationData)
    
    return {
      title,
      description,
      keywords,
      canonicalUrl,
      ogTitle: title,
      ogDescription: description,
      ogImage: this.defaultImage,
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: this.defaultImage,
      structuredData
    }
  }

  private formatLocationString(city: string, state: string | undefined, country: string): string {
    if (state && state.trim()) {
      return `${city}, ${state}, ${country}`
    }
    return `${city}, ${country}`
  }

  private generateCanonicalUrl(locationData: LocationSEOData): string {
    if (!this.baseUrl) return ''
    
    const { city, country, state, coordinates } = locationData
    
    // Create SEO-friendly URL slug
    const citySlug = this.createSlug(city)
    const countrySlug = this.createSlug(country)
    const stateSlug = state ? this.createSlug(state) : ''
    
    let path = `/location/${countrySlug}/${citySlug}`
    if (stateSlug) {
      path = `/location/${countrySlug}/${stateSlug}/${citySlug}`
    }
    
    // Add coordinates as query params for precision
    if (coordinates) {
      path += `?lat=${coordinates.lat.toFixed(4)}&lon=${coordinates.lon.toFixed(4)}`
    }
    
    return `${this.baseUrl}${path}`
  }

  private createSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
  }

  private generateStructuredData(locationData: LocationSEOData, currentTime: Date): any {
    const { city, country, state, coordinates, timezone } = locationData
    
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: this.siteName,
      description: `Calculate golden hour, sunrise, and sunset times for any location worldwide`,
      url: this.baseUrl,
      applicationCategory: 'Photography',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      featureList: [
        'Golden Hour Calculator',
        'Sunrise Time Calculator',
        'Sunset Time Calculator',
        'Blue Hour Calculator',
        'Photography Planning Tool'
      ],
      about: {
        '@type': 'Place',
        name: this.formatLocationString(city, state, country),
        address: {
          '@type': 'PostalAddress',
          addressLocality: city,
          addressRegion: state || '',
          addressCountry: country
        }
      }
    }
    
    // Add geo coordinates if available
    if (coordinates) {
      (structuredData.about as any).geo = {
        '@type': 'GeoCoordinates',
        latitude: coordinates.lat,
        longitude: coordinates.lon
      }
    }
    
    // Add timezone if available
    if (timezone) {
      (structuredData.about as any).timeZone = timezone
    }
    
    return structuredData
  }

  generateMetaTags(metadata: SEOMetadata): string {
    const tags: string[] = []
    
    // Basic meta tags
    tags.push(`<title>${this.escapeHtml(metadata.title)}</title>`)
    tags.push(`<meta name="description" content="${this.escapeHtml(metadata.description)}" />`)
    tags.push(`<meta name="keywords" content="${metadata.keywords.map(k => this.escapeHtml(k)).join(', ')}" />`)
    
    // Canonical URL
    if (metadata.canonicalUrl) {
      tags.push(`<link rel="canonical" href="${this.escapeHtml(metadata.canonicalUrl)}" />`)
    }
    
    // Open Graph tags
    if (metadata.ogTitle) {
      tags.push(`<meta property="og:title" content="${this.escapeHtml(metadata.ogTitle)}" />`)
    }
    if (metadata.ogDescription) {
      tags.push(`<meta property="og:description" content="${this.escapeHtml(metadata.ogDescription)}" />`)
    }
    if (metadata.ogImage) {
      tags.push(`<meta property="og:image" content="${this.escapeHtml(metadata.ogImage)}" />`)
    }
    tags.push(`<meta property="og:type" content="website" />`)
    tags.push(`<meta property="og:site_name" content="${this.escapeHtml(this.siteName)}" />`)
    
    // Twitter Card tags
    tags.push(`<meta name="twitter:card" content="summary_large_image" />`)
    if (metadata.twitterTitle) {
      tags.push(`<meta name="twitter:title" content="${this.escapeHtml(metadata.twitterTitle)}" />`)
    }
    if (metadata.twitterDescription) {
      tags.push(`<meta name="twitter:description" content="${this.escapeHtml(metadata.twitterDescription)}" />`)
    }
    if (metadata.twitterImage) {
      tags.push(`<meta name="twitter:image" content="${this.escapeHtml(metadata.twitterImage)}" />`)
    }
    
    // Structured data
    if (metadata.structuredData) {
      tags.push(`<script type="application/ld+json">${JSON.stringify(metadata.structuredData, null, 2)}</script>`)
    }
    
    // Additional SEO tags
    tags.push(`<meta name="robots" content="index, follow" />`)
    tags.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0" />`)
    tags.push(`<meta name="theme-color" content="#f59e0b" />`)
    
    return tags.join('\n')
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  generateSitemap(locations: LocationSEOData[]): string {
    const urls = locations.map(location => {
      const canonicalUrl = this.generateCanonicalUrl(location)
      const lastmod = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      
      return `  <url>
    <loc>${this.escapeHtml(canonicalUrl)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
    }).join('\n')
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
  }

  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

Sitemap: ${this.baseUrl}/sitemap.xml`
  }

  // Performance optimization for SEO
  preloadCriticalResources(): string[] {
    return [
      `<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin />`,
      `<link rel="preload" href="/css/critical.css" as="style" />`,
      `<link rel="dns-prefetch" href="//nominatim.openstreetmap.org" />`,
      `<link rel="dns-prefetch" href="//ipapi.co" />`,
      `<link rel="preconnect" href="https://fonts.googleapis.com" />`,
      `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`
    ]
  }

  // Generate breadcrumb structured data
  generateBreadcrumbStructuredData(locationData: LocationSEOData): any {
    const { city, country, state } = locationData
    
    const breadcrumbs = [
      { name: 'Home', url: this.baseUrl },
      { name: 'Locations', url: `${this.baseUrl}/locations` },
      { name: country, url: `${this.baseUrl}/location/${this.createSlug(country)}` }
    ]
    
    if (state) {
      breadcrumbs.push({
        name: state,
        url: `${this.baseUrl}/location/${this.createSlug(country)}/${this.createSlug(state)}`
      })
    }
    
    breadcrumbs.push({
      name: city,
      url: this.generateCanonicalUrl(locationData)
    })
    
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    }
  }
}

// Export singleton instance
export const seoOptimizer = new SEOOptimizer()
export type { SEOMetadata, LocationSEOData }
