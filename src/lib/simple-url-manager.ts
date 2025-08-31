/**
 * Simplified Database-Free URL Management System
 * Provides intelligent URL generation and basic redirects without external dependencies
 */

import { generateSEOFriendlyURL, parseLocationSlug } from './url-utils'

// Simplified location data structure
export interface SimpleLocation {
  name: string
  country: string
  state?: string
  coordinates: { lat: number; lng: number }
  urlSlug: string
  keywords: string[]
  category: 'major_city' | 'capital' | 'tourist_destination' | 'photography_hotspot'
}

// Core popular locations for URL generation
export const CORE_LOCATIONS: SimpleLocation[] = [
  {
    name: 'New York City',
    country: 'United States',
    state: 'New York',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    urlSlug: 'new-york-city-ny-usa',
    keywords: ['manhattan', 'brooklyn', 'skyline', 'urban photography', 'golden hour'],
    category: 'major_city'
  },
  {
    name: 'Los Angeles',
    country: 'United States',
    state: 'California',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    urlSlug: 'los-angeles-ca-usa',
    keywords: ['hollywood', 'beaches', 'sunset', 'california', 'golden hour'],
    category: 'major_city'
  },
  {
    name: 'London',
    country: 'United Kingdom',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    urlSlug: 'london-uk',
    keywords: ['big ben', 'thames', 'royal', 'history', 'bridges'],
    category: 'capital'
  },
  {
    name: 'Paris',
    country: 'France',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    urlSlug: 'paris-france',
    keywords: ['eiffel tower', 'romance', 'architecture', 'culture', 'seine'],
    category: 'capital'
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    coordinates: { lat: 35.6762, lng: 139.6503 },
    urlSlug: 'tokyo-japan',
    keywords: ['shibuya', 'skyscrapers', 'neon', 'culture', 'modern'],
    category: 'capital'
  },
  {
    name: 'Sydney',
    country: 'Australia',
    state: 'New South Wales',
    coordinates: { lat: -33.8688, lng: 151.2093 },
    urlSlug: 'sydney-australia',
    keywords: ['opera house', 'harbor bridge', 'beaches', 'harbor', 'bondi'],
    category: 'major_city'
  },
  {
    name: 'Santorini',
    country: 'Greece',
    coordinates: { lat: 36.3932, lng: 25.4615 },
    urlSlug: 'santorini-greece',
    keywords: ['sunset', 'white buildings', 'blue domes', 'cliffs', 'aegean'],
    category: 'photography_hotspot'
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    coordinates: { lat: -8.3405, lng: 115.0920 },
    urlSlug: 'bali-indonesia',
    keywords: ['temples', 'rice terraces', 'beaches', 'tropical', 'sunrise'],
    category: 'photography_hotspot'
  }
]

// Simple redirect rules
export interface SimpleRedirect {
  from: string
  to: string
  type: 'permanent' | 'temporary'
  status: number
}

export const STATIC_REDIRECTS: SimpleRedirect[] = [
  {
    from: '/gh/*',
    to: '/golden-hour/*',
    type: 'permanent',
    status: 301
  },
  {
    from: '/calculator/*',
    to: '/golden-hour/*',
    type: 'permanent',
    status: 301
  },
  {
    from: '/golden-hour/search',
    to: '/golden-hour',
    type: 'permanent',
    status: 301
  }
]

export class SimpleURLManager {
  private locations: Map<string, SimpleLocation> = new Map()
  private slugMap: Map<string, SimpleLocation> = new Map()
  private redirects: Map<string, SimpleRedirect> = new Map()

  constructor() {
    this.initializeLocations()
    this.initializeRedirects()
  }

  private initializeLocations(): void {
    CORE_LOCATIONS.forEach(location => {
      this.locations.set(location.name.toLowerCase(), location)
      this.slugMap.set(location.urlSlug, location)
    })
  }

  private initializeRedirects(): void {
    STATIC_REDIRECTS.forEach((redirect, index) => {
      this.redirects.set(redirect.from, redirect)
    })
  }

  /**
   * Generate URLs for popular locations
   */
  generatePopularLocationURLs(includeDate: boolean = false): string[] {
    const urls: string[] = []
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''

    for (const location of CORE_LOCATIONS) {
      const params = {
        lat: location.coordinates.lat,
        lng: location.coordinates.lng,
        locationName: location.name
      }

      if (includeDate) {
        const today = new Date().toISOString().split('T')[0]
        const urlWithDate = generateSEOFriendlyURL({ ...params, date: today })
        urls.push(`${baseUrl}/golden-hour/${urlWithDate}`)
      }
      
      const url = generateSEOFriendlyURL(params)
      urls.push(`${baseUrl}/golden-hour/${url}`)
    }

    return urls
  }

  /**
   * Search locations by name or keyword
   */
  searchLocations(query: string, limit: number = 10): SimpleLocation[] {
    const searchTerm = query.toLowerCase()
    const results: SimpleLocation[] = []

    for (const location of CORE_LOCATIONS) {
      if (results.length >= limit) break

      // Check name match
      if (location.name.toLowerCase().includes(searchTerm)) {
        results.push(location)
        continue
      }

      // Check keyword match
      if (location.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))) {
        results.push(location)
        continue
      }

      // Check country match
      if (location.country.toLowerCase().includes(searchTerm)) {
        results.push(location)
      }
    }

    return results
  }

  /**
   * Get location by slug
   */
  getLocationBySlug(slug: string): SimpleLocation | undefined {
    return this.slugMap.get(slug)
  }

  /**
   * Get all locations
   */
  getAllLocations(): SimpleLocation[] {
    return CORE_LOCATIONS
  }

  /**
   * Get locations by category
   */
  getLocationsByCategory(category: SimpleLocation['category']): SimpleLocation[] {
    return CORE_LOCATIONS.filter(location => location.category === category)
  }

  /**
   * Check for redirect
   */
  checkRedirect(path: string): SimpleRedirect | null {
    // Direct match
    if (this.redirects.has(path)) {
      return this.redirects.get(path)!
    }

    // Pattern matching for wildcards
    for (const [pattern, redirect] of this.redirects.entries()) {
      if (pattern.includes('*')) {
        const regexPattern = pattern.replace(/\*/g, '(.*)')
        const regex = new RegExp(`^${regexPattern}$`)
        if (regex.test(path)) {
          const match = path.match(regex)
          if (match) {
            const redirectTo = redirect.to.replace(/\*/g, match[1] || '')
            return {
              ...redirect,
              to: redirectTo
            }
          }
        }
      }
    }

    return null
  }

  /**
   * Generate sitemap entries
   */
  generateSitemap(): Array<{ url: string; lastmod: string; priority: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://goldenhourcalculator.com'
    const entries = []

    // Add homepage
    entries.push({
      url: baseUrl,
      lastmod: new Date().toISOString(),
      priority: '1.0'
    })

    // Add location pages
    for (const location of CORE_LOCATIONS) {
      const params = {
        lat: location.coordinates.lat,
        lng: location.coordinates.lng,
        locationName: location.name
      }
      
      const url = generateSEOFriendlyURL(params)
      entries.push({
        url: `${baseUrl}/golden-hour/${url}`,
        lastmod: new Date().toISOString(),
        priority: location.category === 'major_city' || location.category === 'capital' ? '0.9' : '0.8'
      })
    }

    return entries
  }

  /**
   * Get basic stats
   */
  getStats() {
    return {
      totalLocations: CORE_LOCATIONS.length,
      locationsByCategory: {
        major_city: this.getLocationsByCategory('major_city').length,
        capital: this.getLocationsByCategory('capital').length,
        tourist_destination: this.getLocationsByCategory('tourist_destination').length,
        photography_hotspot: this.getLocationsByCategory('photography_hotspot').length
      },
      totalRedirects: STATIC_REDIRECTS.length
    }
  }
}

// Export singleton instance
export const simpleURLManager = new SimpleURLManager()
