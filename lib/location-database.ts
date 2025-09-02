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
  category: "major_city" | "capital" | "tourist_destination" | "photography_hotspot" | "landmark"
  keywords: string[]
  aliases: string[]
  seoScore: number
  estimatedTraffic: "high" | "medium" | "low"
  competitionLevel: "high" | "medium" | "low"
  photographyFeatures: string[]
  bestMonths: number[] // 1-12 representing months
  urlSlug: string
}

export const LOCATION_DATABASE: LocationEntry[] = [
  // Major US Cities
  {
    id: "nyc-usa",
    name: "New York City",
    country: "United States",
    state: "New York",
    coordinates: { lat: 40.7128, lng: -74.006 },
    timezone: "America/New_York",
    population: 8336817,
    category: "major_city",
    keywords: ["manhattan", "brooklyn", "skyline", "urban photography", "golden hour"],
    aliases: ["NYC", "New York", "Manhattan", "Big Apple"],
    seoScore: 95,
    estimatedTraffic: "high",
    competitionLevel: "high",
    photographyFeatures: ["skyline", "urban landscape", "architecture", "street photography"],
    bestMonths: [4, 5, 6, 9, 10, 11],
    urlSlug: "new-york-city-ny-usa",
  },
  {
    id: "la-usa",
    name: "Los Angeles",
    country: "United States",
    state: "California",
    coordinates: { lat: 34.0522, lng: -118.2437 },
    timezone: "America/Los_Angeles",
    population: 3898747,
    category: "major_city",
    keywords: ["hollywood", "beaches", "sunset", "california", "golden hour"],
    aliases: ["LA", "City of Angels", "Hollywood"],
    seoScore: 92,
    estimatedTraffic: "high",
    competitionLevel: "high",
    photographyFeatures: ["beaches", "mountains", "urban landscape", "sunset"],
    bestMonths: [1, 2, 3, 4, 5, 10, 11, 12],
    urlSlug: "los-angeles-ca-usa",
  },
  {
    id: "paris-france",
    name: "Paris",
    country: "France",
    coordinates: { lat: 48.8566, lng: 2.3522 },
    timezone: "Europe/Paris",
    population: 2161000,
    category: "capital",
    keywords: ["eiffel tower", "romance", "architecture", "culture", "seine"],
    aliases: ["City of Light", "City of Love"],
    seoScore: 98,
    estimatedTraffic: "high",
    competitionLevel: "high",
    photographyFeatures: ["landmarks", "architecture", "river", "gardens"],
    bestMonths: [4, 5, 6, 7, 8, 9, 10],
    urlSlug: "paris-france",
  },
  {
    id: "london-uk",
    name: "London",
    country: "United Kingdom",
    coordinates: { lat: 51.5074, lng: -0.1278 },
    timezone: "Europe/London",
    population: 8982000,
    category: "capital",
    keywords: ["big ben", "thames", "royal", "history", "bridges"],
    aliases: ["The Big Smoke", "The Square Mile"],
    seoScore: 96,
    estimatedTraffic: "high",
    competitionLevel: "high",
    photographyFeatures: ["landmarks", "river", "architecture", "parks"],
    bestMonths: [5, 6, 7, 8, 9],
    urlSlug: "london-uk",
  },
  {
    id: "tokyo-japan",
    name: "Tokyo",
    country: "Japan",
    coordinates: { lat: 35.6762, lng: 139.6503 },
    timezone: "Asia/Tokyo",
    population: 13929286,
    category: "capital",
    keywords: ["shibuya", "skyscrapers", "neon", "culture", "modern"],
    aliases: ["Edo"],
    seoScore: 93,
    estimatedTraffic: "high",
    competitionLevel: "high",
    photographyFeatures: ["neon lights", "skyscrapers", "temples", "street scenes"],
    bestMonths: [3, 4, 5, 10, 11],
    urlSlug: "tokyo-japan",
  },
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
    LOCATION_DATABASE.forEach((location) => {
      this.locations.set(location.id, location)
      this.slugMap.set(location.urlSlug, location)

      // Build keyword index
      location.keywords.forEach((keyword) => {
        const normalized = keyword.toLowerCase()
        if (!this.keywordIndex.has(normalized)) {
          this.keywordIndex.set(normalized, [])
        }
        this.keywordIndex.get(normalized)!.push(location)
      })

      // Index aliases
      location.aliases.forEach((alias) => {
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
   * Find the nearest city to given coordinates using Haversine formula
   */
  findNearestCity(lat: number, lng: number, maxDistance = 500): LocationEntry | null {
    const toRadians = (degrees: number) => degrees * (Math.PI / 180)

    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371 // Earth's radius in kilometers
      const dLat = toRadians(lat2 - lat1)
      const dLng = toRadians(lng2 - lng1)
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    }

    let nearestCity: LocationEntry | null = null
    let minDistance = Number.POSITIVE_INFINITY

    for (const location of this.getAllLocations()) {
      const distance = calculateDistance(lat, lng, location.coordinates.lat, location.coordinates.lng)

      if (distance < minDistance && distance <= maxDistance) {
        minDistance = distance
        nearestCity = location
      }
    }

    return nearestCity
  }
}

// Export singleton instance
export const locationDatabase = LocationDatabase.getInstance()
