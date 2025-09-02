/**
 * Comprehensive location database for URL generation and location services
 * Contains popular cities, landmarks, and photography destinations worldwide
 */

export interface LocationEntry {
  id: string
  name: string
  country: string
  state?: string
  region?: string
  coordinates: {
    lat: number
    lng: number
  }
  timezone: string
  population?: number
  elevation?: number
  category: 'major_city' | 'capital' | 'tourist_destination' | 'photography_hotspot' | 'landmark'
  keywords: string[]
  aliases: string[]
  seoScore: number
  estimatedTraffic: 'high' | 'medium' | 'low'
  competitionLevel: 'high' | 'medium' | 'low'
  photographyFeatures: string[]
  bestMonths: number[] // 1-12 representing months
  urlSlug: string
}

export const LOCATION_DATABASE: LocationEntry[] = [
  // Major US Cities
  {
    id: 'nyc-usa',
    name: 'New York City',
    country: 'United States',
    state: 'New York',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    timezone: 'America/New_York',
    population: 8336817,
    category: 'major_city',
    keywords: ['manhattan', 'brooklyn', 'skyline', 'urban photography', 'golden hour'],
    aliases: ['NYC', 'New York', 'Manhattan', 'Big Apple'],
    seoScore: 95,
    estimatedTraffic: 'high',
    competitionLevel: 'high',
    photographyFeatures: ['skyline', 'urban landscape', 'architecture', 'street photography'],
    bestMonths: [4, 5, 6, 9, 10, 11],
    urlSlug: 'new-york-city-ny-usa'
  },
  {
    id: 'la-usa',
    name: 'Los Angeles',
    country: 'United States',
    state: 'California',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    timezone: 'America/Los_Angeles',
    population: 3898747,
    category: 'major_city',
    keywords: ['hollywood', 'beaches', 'sunset', 'california', 'golden hour'],
    aliases: ['LA', 'City of Angels', 'Hollywood'],
    seoScore: 92,
    estimatedTraffic: 'high',
    competitionLevel: 'high',
    photographyFeatures: ['beaches', 'mountains', 'urban landscape', 'sunset'],
    bestMonths: [1, 2, 3, 4, 5, 10, 11, 12],
    urlSlug: 'los-angeles-ca-usa'
  },
  {
    id: 'chicago-usa',
    name: 'Chicago',
    country: 'United States',
    state: 'Illinois',
    coordinates: { lat: 41.8781, lng: -87.6298 },
    timezone: 'America/Chicago',
    population: 2693976,
    category: 'major_city',
    keywords: ['architecture', 'lakefront', 'skyline', 'windy city'],
    aliases: ['Chi-town', 'Windy City', 'Second City'],
    seoScore: 88,
    estimatedTraffic: 'high',
    competitionLevel: 'medium',
    photographyFeatures: ['architecture', 'lakefront', 'skyline', 'urban landscape'],
    bestMonths: [5, 6, 7, 8, 9, 10],
    urlSlug: 'chicago-il-usa'
  },
  {
    id: 'sf-usa',
    name: 'San Francisco',
    country: 'United States',
    state: 'California',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    timezone: 'America/Los_Angeles',
    population: 873965,
    category: 'major_city',
    keywords: ['golden gate', 'bay area', 'hills', 'fog', 'bridge'],
    aliases: ['SF', 'San Fran', 'City by the Bay'],
    seoScore: 90,
    estimatedTraffic: 'high',
    competitionLevel: 'high',
    photographyFeatures: ['bridges', 'hills', 'bay views', 'architecture'],
    bestMonths: [4, 5, 6, 9, 10, 11],
    urlSlug: 'san-francisco-ca-usa'
  },
  {
    id: 'miami-usa',
    name: 'Miami',
    country: 'United States',
    state: 'Florida',
    coordinates: { lat: 25.7617, lng: -80.1918 },
    timezone: 'America/New_York',
    population: 442241,
    category: 'major_city',
    keywords: ['beaches', 'art deco', 'nightlife', 'tropical', 'ocean'],
    aliases: ['Magic City', 'Miami Beach'],
    seoScore: 85,
    estimatedTraffic: 'high',
    competitionLevel: 'medium',
    photographyFeatures: ['beaches', 'art deco', 'ocean', 'tropical'],
    bestMonths: [1, 2, 3, 4, 11, 12],
    urlSlug: 'miami-fl-usa'
  },

  // European Cities
  {
    id: 'paris-france',
    name: 'Paris',
    country: 'France',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    timezone: 'Europe/Paris',
    population: 2161000,
    category: 'capital',
    keywords: ['eiffel tower', 'romance', 'architecture', 'culture', 'seine'],
    aliases: ['City of Light', 'City of Love'],
    seoScore: 98,
    estimatedTraffic: 'high',
    competitionLevel: 'high',
    photographyFeatures: ['landmarks', 'architecture', 'river', 'gardens'],
    bestMonths: [4, 5, 6, 7, 8, 9, 10],
    urlSlug: 'paris-france'
  },
  {
    id: 'london-uk',
    name: 'London',
    country: 'United Kingdom',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    timezone: 'Europe/London',
    population: 8982000,
    category: 'capital',
    keywords: ['big ben', 'thames', 'royal', 'history', 'bridges'],
    aliases: ['The Big Smoke', 'The Square Mile'],
    seoScore: 96,
    estimatedTraffic: 'high',
    competitionLevel: 'high',
    photographyFeatures: ['landmarks', 'river', 'architecture', 'parks'],
    bestMonths: [5, 6, 7, 8, 9],
    urlSlug: 'london-uk'
  },
  {
    id: 'rome-italy',
    name: 'Rome',
    country: 'Italy',
    coordinates: { lat: 41.9028, lng: 12.4964 },
    timezone: 'Europe/Rome',
    population: 2873000,
    category: 'capital',
    keywords: ['colosseum', 'ancient', 'vatican', 'history', 'ruins'],
    aliases: ['Eternal City', 'Caput Mundi'],
    seoScore: 94,
    estimatedTraffic: 'high',
    competitionLevel: 'high',
    photographyFeatures: ['ancient architecture', 'ruins', 'churches', 'fountains'],
    bestMonths: [4, 5, 6, 9, 10, 11],
    urlSlug: 'rome-italy'
  },
  {
    id: 'barcelona-spain',
    name: 'Barcelona',
    country: 'Spain',
    coordinates: { lat: 41.3851, lng: 2.1734 },
    timezone: 'Europe/Madrid',
    population: 1620343,
    category: 'major_city',
    keywords: ['gaudi', 'sagrada familia', 'beaches', 'architecture', 'mediterranean'],
    aliases: ['Barca', 'Ciudad Condal'],
    seoScore: 91,
    estimatedTraffic: 'high',
    competitionLevel: 'medium',
    photographyFeatures: ['unique architecture', 'beaches', 'parks', 'gothic quarter'],
    bestMonths: [4, 5, 6, 7, 8, 9, 10],
    urlSlug: 'barcelona-spain'
  },
  {
    id: 'amsterdam-netherlands',
    name: 'Amsterdam',
    country: 'Netherlands',
    coordinates: { lat: 52.3676, lng: 4.9041 },
    timezone: 'Europe/Amsterdam',
    population: 821752,
    category: 'capital',
    keywords: ['canals', 'bikes', 'tulips', 'museums', 'bridges'],
    aliases: ['Venice of the North'],
    seoScore: 89,
    estimatedTraffic: 'high',
    competitionLevel: 'medium',
    photographyFeatures: ['canals', 'bridges', 'historic buildings', 'flowers'],
    bestMonths: [4, 5, 6, 7, 8, 9],
    urlSlug: 'amsterdam-netherlands'
  },

  // Asian Cities
  {
    id: 'tokyo-japan',
    name: 'Tokyo',
    country: 'Japan',
    coordinates: { lat: 35.6762, lng: 139.6503 },
    timezone: 'Asia/Tokyo',
    population: 13929286,
    category: 'capital',
    keywords: ['shibuya', 'skyscrapers', 'neon', 'culture', 'modern'],
    aliases: ['Edo'],
    seoScore: 93,
    estimatedTraffic: 'high',
    competitionLevel: 'high',
    photographyFeatures: ['neon lights', 'skyscrapers', 'temples', 'street scenes'],
    bestMonths: [3, 4, 5, 10, 11],
    urlSlug: 'tokyo-japan'
  },
  {
    id: 'singapore',
    name: 'Singapore',
    country: 'Singapore',
    coordinates: { lat: 1.3521, lng: 103.8198 },
    timezone: 'Asia/Singapore',
    population: 5850342,
    category: 'capital',
    keywords: ['marina bay', 'gardens', 'skyline', 'tropical', 'modern'],
    aliases: ['Lion City', 'Garden City'],
    seoScore: 87,
    estimatedTraffic: 'high',
    competitionLevel: 'medium',
    photographyFeatures: ['modern architecture', 'gardens', 'skyline', 'waterfront'],
    bestMonths: [1, 2, 3, 4, 11, 12],
    urlSlug: 'singapore'
  },
  {
    id: 'hong-kong',
    name: 'Hong Kong',
    country: 'Hong Kong',
    coordinates: { lat: 22.3193, lng: 114.1694 },
    timezone: 'Asia/Hong_Kong',
    population: 7496981,
    category: 'major_city',
    keywords: ['skyline', 'harbor', 'neon', 'skyscrapers', 'victoria peak'],
    aliases: ['Pearl of the Orient', 'Fragrant Harbor'],
    seoScore: 86,
    estimatedTraffic: 'high',
    competitionLevel: 'medium',
    photographyFeatures: ['skyline', 'harbor', 'neon lights', 'mountains'],
    bestMonths: [10, 11, 12, 1, 2, 3],
    urlSlug: 'hong-kong'
  },

  // Photography Hotspots & Natural Landmarks
  {
    id: 'santorini-greece',
    name: 'Santorini',
    country: 'Greece',
    coordinates: { lat: 36.3932, lng: 25.4615 },
    timezone: 'Europe/Athens',
    category: 'photography_hotspot',
    keywords: ['sunset', 'white buildings', 'blue domes', 'cliffs', 'aegean'],
    aliases: ['Thira', 'Thera'],
    seoScore: 92,
    estimatedTraffic: 'high',
    competitionLevel: 'high',
    photographyFeatures: ['sunset', 'white architecture', 'ocean views', 'cliffs'],
    bestMonths: [4, 5, 6, 7, 8, 9, 10],
    urlSlug: 'santorini-greece'
  },
  {
    id: 'bali-indonesia',
    name: 'Bali',
    country: 'Indonesia',
    coordinates: { lat: -8.3405, lng: 115.0920 },
    timezone: 'Asia/Makassar',
    category: 'photography_hotspot',
    keywords: ['temples', 'rice terraces', 'beaches', 'tropical', 'sunrise'],
    aliases: ['Island of the Gods'],
    seoScore: 90,
    estimatedTraffic: 'high',
    competitionLevel: 'high',
    photographyFeatures: ['temples', 'rice terraces', 'beaches', 'volcanoes'],
    bestMonths: [4, 5, 6, 7, 8, 9],
    urlSlug: 'bali-indonesia'
  },
  {
    id: 'iceland-reykjavik',
    name: 'Reykjavik',
    country: 'Iceland',
    coordinates: { lat: 64.1466, lng: -21.9426 },
    timezone: 'Atlantic/Reykjavik',
    population: 131136,
    category: 'capital',
    keywords: ['northern lights', 'geysers', 'waterfalls', 'aurora', 'midnight sun'],
    aliases: ['Smoky Bay'],
    seoScore: 88,
    estimatedTraffic: 'medium',
    competitionLevel: 'medium',
    photographyFeatures: ['northern lights', 'waterfalls', 'geysers', 'landscapes'],
    bestMonths: [6, 7, 8, 9, 10, 11, 12, 1, 2, 3],
    urlSlug: 'reykjavik-iceland'
  },
  {
    id: 'dubai-uae',
    name: 'Dubai',
    country: 'United Arab Emirates',
    coordinates: { lat: 25.2048, lng: 55.2708 },
    timezone: 'Asia/Dubai',
    population: 3331420,
    category: 'major_city',
    keywords: ['burj khalifa', 'desert', 'luxury', 'modern', 'skyscrapers'],
    aliases: ['City of Gold'],
    seoScore: 89,
    estimatedTraffic: 'high',
    competitionLevel: 'medium',
    photographyFeatures: ['skyscrapers', 'desert', 'modern architecture', 'luxury'],
    bestMonths: [11, 12, 1, 2, 3, 4],
    urlSlug: 'dubai-uae'
  },
  {
    id: 'cape-town-south-africa',
    name: 'Cape Town',
    country: 'South Africa',
    coordinates: { lat: -33.9249, lng: 18.4241 },
    timezone: 'Africa/Johannesburg',
    population: 433688,
    category: 'major_city',
    keywords: ['table mountain', 'penguins', 'wine', 'ocean', 'mountains'],
    aliases: ['Mother City', 'Tavern of the Seas'],
    seoScore: 85,
    estimatedTraffic: 'medium',
    competitionLevel: 'medium',
    photographyFeatures: ['mountains', 'ocean', 'penguins', 'vineyards'],
    bestMonths: [11, 12, 1, 2, 3, 4],
    urlSlug: 'cape-town-south-africa'
  },

  // Additional Popular Destinations
  {
    id: 'sydney-australia',
    name: 'Sydney',
    country: 'Australia',
    state: 'New South Wales',
    coordinates: { lat: -33.8688, lng: 151.2093 },
    timezone: 'Australia/Sydney',
    population: 5312163,
    category: 'major_city',
    keywords: ['opera house', 'harbor bridge', 'beaches', 'harbor', 'bondi'],
    aliases: ['Harbour City'],
    seoScore: 91,
    estimatedTraffic: 'high',
    competitionLevel: 'medium',
    photographyFeatures: ['opera house', 'harbor bridge', 'beaches', 'harbor'],
    bestMonths: [9, 10, 11, 12, 1, 2, 3, 4],
    urlSlug: 'sydney-australia'
  },
  {
    id: 'rio-brazil',
    name: 'Rio de Janeiro',
    country: 'Brazil',
    coordinates: { lat: -22.9068, lng: -43.1729 },
    timezone: 'America/Sao_Paulo',
    population: 6748000,
    category: 'major_city',
    keywords: ['christ redeemer', 'copacabana', 'carnival', 'beaches', 'sugarloaf'],
    aliases: ['Cidade Maravilhosa', 'Marvelous City'],
    seoScore: 87,
    estimatedTraffic: 'high',
    competitionLevel: 'medium',
    photographyFeatures: ['christ statue', 'beaches', 'mountains', 'carnival'],
    bestMonths: [4, 5, 6, 7, 8, 9, 10],
    urlSlug: 'rio-de-janeiro-brazil'
  },
  {
    id: 'machu-picchu-peru',
    name: 'Machu Picchu',
    country: 'Peru',
    coordinates: { lat: -13.1631, lng: -72.5450 },
    timezone: 'America/Lima',
    elevation: 2430,
    category: 'landmark',
    keywords: ['ancient ruins', 'inca', 'mountains', 'archaeology', 'sunrise'],
    aliases: ['Lost City of the Incas'],
    seoScore: 94,
    estimatedTraffic: 'high',
    competitionLevel: 'high',
    photographyFeatures: ['ancient ruins', 'mountains', 'sunrise', 'clouds'],
    bestMonths: [5, 6, 7, 8, 9],
    urlSlug: 'machu-picchu-peru'
  },
  {
    id: 'banff-canada',
    name: 'Banff',
    country: 'Canada',
    state: 'Alberta',
    coordinates: { lat: 51.1784, lng: -115.5708 },
    timezone: 'America/Edmonton',
    population: 7847,
    elevation: 1400,
    category: 'photography_hotspot',
    keywords: ['mountains', 'lakes', 'wildlife', 'national park', 'rockies'],
    aliases: ['Banff National Park'],
    seoScore: 86,
    estimatedTraffic: 'medium',
    competitionLevel: 'medium',
    photographyFeatures: ['mountains', 'lakes', 'wildlife', 'forests'],
    bestMonths: [6, 7, 8, 9, 10],
    urlSlug: 'banff-alberta-canada'
  }
]

/**
 * Location database utilities
 */
export class LocationDatabase {
  private static instance: LocationDatabase
  private locations: Map<string, LocationEntry>
  private slugMap: Map<string, LocationEntry>
  private keywordIndex: Map<string, LocationEntry[]>

  private constructor() {
    this.locations = new Map()
    this.slugMap = new Map()
    this.keywordIndex = new Map()
    this.buildIndexes()
  }

  static getInstance(): LocationDatabase {
    if (!LocationDatabase.instance) {
      LocationDatabase.instance = new LocationDatabase()
    }
    return LocationDatabase.instance
  }

  private buildIndexes(): void {
    LOCATION_DATABASE.forEach(location => {
      this.locations.set(location.id, location)
      this.slugMap.set(location.urlSlug, location)
      
      // Build keyword index
      location.keywords.forEach(keyword => {
        const normalized = keyword.toLowerCase()
        if (!this.keywordIndex.has(normalized)) {
          this.keywordIndex.set(normalized, [])
        }
        this.keywordIndex.get(normalized)!.push(location)
      })
      
      // Index aliases
      location.aliases.forEach(alias => {
        const normalized = alias.toLowerCase()
        if (!this.keywordIndex.has(normalized)) {
          this.keywordIndex.set(normalized, [])
        }
        this.keywordIndex.get(normalized)!.push(location)
      })
    })
  }

  /**
   * Get all locations
   */
  getAllLocations(): LocationEntry[] {
    return Array.from(this.locations.values())
  }

  /**
   * Get location by ID
   */
  getLocationById(id: string): LocationEntry | undefined {
    return this.locations.get(id)
  }

  /**
   * Get location by URL slug
   */
  getLocationBySlug(slug: string): LocationEntry | undefined {
    return this.slugMap.get(slug)
  }

  /**
   * Search locations by query
   */
  searchLocations(query: string, limit: number = 10): LocationEntry[] {
    const normalized = query.toLowerCase()
    const results = new Set<LocationEntry>()
    
    // Exact matches first
    if (this.keywordIndex.has(normalized)) {
      this.keywordIndex.get(normalized)!.forEach(loc => results.add(loc))
    }
    
    // Partial matches
    for (const [keyword, locations] of this.keywordIndex.entries()) {
      if (keyword.includes(normalized) || normalized.includes(keyword)) {
        locations.forEach(loc => results.add(loc))
      }
    }
    
    // Name and country matches
    this.locations.forEach(location => {
      if (location.name.toLowerCase().includes(normalized) ||
          location.country.toLowerCase().includes(normalized) ||
          (location.state && location.state.toLowerCase().includes(normalized))) {
        results.add(location)
      }
    })
    
    return Array.from(results)
      .sort((a, b) => b.seoScore - a.seoScore)
      .slice(0, limit)
  }

  /**
   * Get locations by category
   */
  getLocationsByCategory(category: LocationEntry['category']): LocationEntry[] {
    return this.getAllLocations().filter(loc => loc.category === category)
  }

  /**
   * Get popular locations (high traffic)
   */
  getPopularLocations(limit: number = 50): LocationEntry[] {
    return this.getAllLocations()
      .filter(loc => loc.estimatedTraffic === 'high')
      .sort((a, b) => b.seoScore - a.seoScore)
      .slice(0, limit)
  }

  /**
   * Get locations by traffic level
   */
  getLocationsByTraffic(traffic: 'high' | 'medium' | 'low'): LocationEntry[] {
    return this.getAllLocations().filter(loc => loc.estimatedTraffic === traffic)
  }

  /**
   * Get locations suitable for current month
   */
  getLocationsByMonth(month: number): LocationEntry[] {
    return this.getAllLocations().filter(loc => loc.bestMonths.includes(month))
  }

  /**
   * Get locations by country
   */
  getLocationsByCountry(country: string): LocationEntry[] {
    return this.getAllLocations().filter(loc => 
      loc.country.toLowerCase() === country.toLowerCase()
    )
  }

  /**
   * Get random locations
   */
  getRandomLocations(count: number = 10): LocationEntry[] {
    const all = this.getAllLocations()
    const shuffled = [...all].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  /**
   * Get locations within a bounding box
   */
  getLocationsInBounds(
    northEast: { lat: number; lng: number },
    southWest: { lat: number; lng: number }
  ): LocationEntry[] {
    return this.getAllLocations().filter(loc => {
      const { lat, lng } = loc.coordinates
      return lat <= northEast.lat && lat >= southWest.lat &&
             lng <= northEast.lng && lng >= southWest.lng
    })
  }

  /**
   * Find the nearest city to given coordinates using Haversine formula
   */
  findNearestCity(lat: number, lng: number, maxDistance: number = 500): LocationEntry | null {
    const toRadians = (degrees: number) => degrees * (Math.PI / 180)
    
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371 // Earth's radius in kilometers
      const dLat = toRadians(lat2 - lat1)
      const dLng = toRadians(lng2 - lng1)
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    }

    let nearestCity: LocationEntry | null = null
    let minDistance = Infinity

    for (const location of this.getAllLocations()) {
      const distance = calculateDistance(lat, lng, location.coordinates.lat, location.coordinates.lng)
      
      if (distance < minDistance && distance <= maxDistance) {
        minDistance = distance
        nearestCity = location
      }
    }

    return nearestCity
  }

  /**
   * Get statistics about the database
   */
  getStats() {
    const all = this.getAllLocations()
    return {
      total: all.length,
      byCategory: {
        major_city: all.filter(l => l.category === 'major_city').length,
        capital: all.filter(l => l.category === 'capital').length,
        tourist_destination: all.filter(l => l.category === 'tourist_destination').length,
        photography_hotspot: all.filter(l => l.category === 'photography_hotspot').length,
        landmark: all.filter(l => l.category === 'landmark').length
      },
      byTraffic: {
        high: all.filter(l => l.estimatedTraffic === 'high').length,
        medium: all.filter(l => l.estimatedTraffic === 'medium').length,
        low: all.filter(l => l.estimatedTraffic === 'low').length
      },
      byCountry: all.reduce((acc, loc) => {
        acc[loc.country] = (acc[loc.country] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      avgSeoScore: Math.round(all.reduce((sum, loc) => sum + loc.seoScore, 0) / all.length)
    }
  }
}

// Export singleton instance
export const locationDatabase = LocationDatabase.getInstance()
