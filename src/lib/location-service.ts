import { locationCache } from "./location-cache"
import { apiOptimizer, type RequestConfig } from "./api-optimizer"
import { locationValidator } from "./location-validator"
import { locationDatabase } from "./location-database"

interface LocationData {
  city: string
  country: string
  state?: string
  region?: string
  postal?: string
  address?: string
  lat: number
  lon: number
  timezone: string
  accuracy?: string
  quality?: number // Quality score 0-100
  source?: string // Detection source
  timestamp?: number // When detected
  confidence?: number // Confidence level 0-1
}

class LocationService {
  private cache = new Map<string, { data: LocationData; timestamp: number }>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes
  private backgroundRefreshTimeout: NodeJS.Timeout | null = null
  private backgroundRefreshInterval = 2 * 60 * 1000 // 2 minutes for background refresh
  private retryAttempts = 3
  private retryDelay = 1000 // 1 second
  private isDetecting = false
  private lastDetection: LocationData | null = null
  private detectionListeners: ((location: LocationData) => void)[] = []
  private locationDatabase = locationDatabase

  async detectLocation(forceRefresh = false): Promise<LocationData> {
    console.log("🧪 LocationService.detectLocation called, forceRefresh:", forceRefresh)
    const cacheKey = "current-location"

    // Check intelligent cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cached = locationCache.getWithMetadata(cacheKey)
      if (cached) {
        console.log("🧪 Using cached location:", cached.data)
        this.lastDetection = cached.data

        // If cache is getting stale, trigger background refresh
        if (locationCache.isStale(cacheKey, 10 * 60 * 1000)) {
          // 10 minutes
          this.scheduleBackgroundRefresh()
        }

        return cached.data
      }
    }

    // Prevent multiple simultaneous detections
    if (this.isDetecting && !forceRefresh) {
      return this.lastDetection || this.getFallbackLocation()
    }

    this.isDetecting = true
    console.log("🧪 Starting location detection...")

    try {
      // Try multiple detection methods with retry logic
      const detectionMethods = [
        { method: () => this.getBrowserLocationWithRetry(), priority: 1, name: "GPS" },
        { method: () => this.getIPLocationWithRetry(), priority: 2, name: "IP" },
        { method: () => this.getTimezoneBasedLocation(), priority: 3, name: "Timezone" },
      ]

      console.log(
        "🧪 Running detection methods:",
        detectionMethods.map((m) => m.name),
      )
      // Run all methods in parallel but prioritize by accuracy
      const results = await Promise.allSettled(
        detectionMethods.map(async ({ method, priority, name }) => {
          console.log("🧪 Trying method:", name)
          const result = await method()
          console.log("🧪 Method", name, "result:", result)
          return result ? { ...result, priority, source: name } : null
        }),
      )
      console.log("🧪 All detection methods completed, results:", results)

      // Find the best result based on priority and quality
      let bestLocation: LocationData | null = null
      let bestScore = -1

      for (const result of results) {
        if (result.status === "fulfilled" && result.value) {
          const location = result.value
          const score = this.calculateLocationScore(location)
          if (score > bestScore) {
            bestScore = score
            bestLocation = location
          }
        }
      }

      if (bestLocation) {
        bestLocation.quality = bestScore
        bestLocation.timestamp = Date.now()
        this.lastDetection = bestLocation

        // Update cache with intelligent caching
        locationCache.setLocation(cacheKey, bestLocation, bestLocation.source || "unknown")

        // Also cache by coordinates for future geocoding
        if (bestLocation.lat && bestLocation.lon) {
          const coordKey = `coords:${bestLocation.lat.toFixed(4)},${bestLocation.lon.toFixed(4)}`
          locationCache.setLocation(coordKey, bestLocation, bestLocation.source || "unknown")
        }

        this.notifyListeners(bestLocation)

        // Schedule background refresh
        this.scheduleBackgroundRefresh()

        return bestLocation
      }

      // If all methods fail, return fallback
      const fallback = this.getFallbackLocation()
      this.lastDetection = fallback

      // Cache fallback with low TTL
      locationCache.set(cacheKey, fallback, {
        ttl: 5 * 60 * 1000, // 5 minutes for fallback
        quality: 10,
        source: "Fallback",
      })

      return fallback
    } finally {
      this.isDetecting = false
    }
  }

  private async getBrowserLocation(): Promise<LocationData | null> {
    if (!navigator.geolocation) {
      return null
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000, // Reduced timeout for faster fallback
          maximumAge: 300000,
        })
      })

      const { latitude, longitude } = position.coords
      return await this.reverseGeocode(latitude, longitude)
    } catch (error) {
      console.log("Browser geolocation failed:", error)
      return null
    }
  }

  private async getBrowserLocationWithRetry(): Promise<LocationData | null> {
    if (!navigator.geolocation) {
      return null
    }

    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000, // 1 minute
          })
        })

        const locationData = await this.reverseGeocode(position.coords.latitude, position.coords.longitude)
        if (locationData) {
          locationData.quality = 95
          locationData.source = "GPS"
          locationData.confidence = 0.95
          return locationData
        }
      } catch (error) {
        console.log(`GPS attempt ${attempt + 1} failed:`, error)
        if (attempt < this.retryAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay * (attempt + 1)))
        }
      }
    }

    return null
  }

  private async getIPLocationWithRetry(): Promise<LocationData | null> {
    const ipServices: RequestConfig[] = [
      {
        url: "/api/location",
        priority: "high",
        timeout: 8000,
        retries: 2,
        cacheKey: "ip-location-server",
      },
      {
        url: "https://ip-api.com/json/",
        priority: "medium",
        timeout: 6000,
        retries: 1,
        cacheKey: "ip-location-ipapi-com",
      },
      {
        url: "https://ipinfo.io/json",
        priority: "low",
        timeout: 5000,
        retries: 1,
        cacheKey: "ip-location-ipinfo",
      },
    ]

    // Use batch processing for parallel requests
    const results = await apiOptimizer.batchRequests(ipServices)

    // Process results and find the best one
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const service = ipServices[i]

      if (result.success && result.data) {
        let locationData: LocationData

        if (service.url.includes("ipapi.co")) {
          locationData = {
            city: result.data.city || "Unknown",
            country: result.data.country_name || "Unknown",
            state: result.data.region || "",
            region: result.data.region || "",
            postal: result.data.postal || "",
            address:
              `${result.data.city || "Unknown"}, ${result.data.region || ""}, ${result.data.country_name || "Unknown"}`
                .replace(/, ,/g, ",")
                .replace(/^,|,$/g, ""),
            lat: Number.parseFloat(result.data.latitude) || 0,
            lon: Number.parseFloat(result.data.longitude) || 0,
            timezone: result.data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            accuracy: "IP-based",
            quality: 60,
            source: "IP API (ipapi.co)",
            timestamp: Date.now(),
            confidence: 0.6,
          }
        } else if (service.url.includes("ip-api.com")) {
          locationData = {
            city: result.data.city || "Unknown",
            country: result.data.country || "Unknown",
            state: result.data.regionName || "",
            region: result.data.regionName || "",
            postal: result.data.zip || "",
            address:
              `${result.data.city || "Unknown"}, ${result.data.regionName || ""}, ${result.data.country || "Unknown"}`
                .replace(/, ,/g, ",")
                .replace(/^,|,$/g, ""),
            lat: Number.parseFloat(result.data.lat) || 0,
            lon: Number.parseFloat(result.data.lon) || 0,
            timezone: result.data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            accuracy: "IP-based",
            quality: 55,
            source: "IP API (ip-api.com)",
            timestamp: Date.now(),
            confidence: 0.55,
          }
        } else {
          // Our API endpoint
          locationData = {
            ...result.data,
            quality: result.data.quality || 70,
            source: result.data.source || "Server IP Detection",
            timestamp: Date.now(),
            confidence: result.data.confidence || 0.7,
          }
        }

        // Validate and enhance location data
        locationData = this.validateAndEnhanceLocation(locationData, locationData.source || "IP Detection")

        return locationData
      }
    }

    return null
  }

  private async getTimezoneBasedLocation(): Promise<LocationData | null> {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const timezoneToLocation = {
        "America/New_York": { city: "New York", country: "United States", lat: 40.7128, lon: -74.006, state: "NY" },
        "America/Los_Angeles": {
          city: "Los Angeles",
          country: "United States",
          lat: 34.0522,
          lon: -118.2437,
          state: "CA",
        },
        "America/Chicago": { city: "Chicago", country: "United States", lat: 41.8781, lon: -87.6298, state: "IL" },
        "Europe/London": { city: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
        "Europe/Paris": { city: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
        "Asia/Tokyo": { city: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
        "Australia/Sydney": { city: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
      }

      const locationInfo = timezoneToLocation[timezone as keyof typeof timezoneToLocation]
      if (locationInfo) {
        let locationData: LocationData = {
          ...locationInfo,
          timezone,
          address: `${locationInfo.city}, ${locationInfo.country}`,
          accuracy: "Timezone-based",
          confidence: 0.3, // Low confidence for timezone
        }

        // Validate and enhance location data
        locationData = this.validateAndEnhanceLocation(locationData, "Timezone Detection")

        return locationData
      }
    } catch (error) {
      console.log("Timezone-based location failed:", error)
    }
    return null
  }

  private calculateLocationScore(location: LocationData): number {
    let score = 0

    // Base score from confidence
    score += (location.confidence || 0) * 50

    // Accuracy bonus
    if (location.accuracy?.includes("GPS")) score += 30
    else if (location.accuracy?.includes("IP")) score += 20
    else if (location.accuracy?.includes("Timezone")) score += 10

    // Data completeness bonus
    if (location.city && location.country) score += 10
    if (location.state) score += 5
    if (location.timezone) score += 5

    return Math.min(100, score)
  }

  private notifyListeners(location: LocationData): void {
    this.detectionListeners.forEach((listener) => {
      try {
        listener(location)
      } catch (error) {
        console.error("Error in location listener:", error)
      }
    })
  }

  private scheduleBackgroundRefresh(): void {
    // Clear existing timeout
    if (this.backgroundRefreshTimeout) {
      clearTimeout(this.backgroundRefreshTimeout)
    }

    // Calculate refresh interval based on location quality
    let refreshInterval = 30 * 60 * 1000 // Default 30 minutes

    if (this.lastDetection?.quality) {
      if (this.lastDetection.quality >= 80) {
        refreshInterval = 60 * 60 * 1000 // 1 hour for high quality
      } else if (this.lastDetection.quality >= 60) {
        refreshInterval = 30 * 60 * 1000 // 30 minutes for medium quality
      } else {
        refreshInterval = 15 * 60 * 1000 // 15 minutes for low quality
      }
    }

    this.backgroundRefreshTimeout = setTimeout(async () => {
      try {
        await this.detectLocation(true)
      } catch (error) {
        console.log("Background location refresh failed:", error)
        // Retry with exponential backoff
        setTimeout(
          () => {
            this.scheduleBackgroundRefresh()
          },
          Math.min(refreshInterval * 2, 60 * 60 * 1000),
        ) // Max 1 hour
      }
    }, refreshInterval)
  }

  // Public method to subscribe to location updates
  onLocationUpdate(callback: (location: LocationData) => void): () => void {
    this.detectionListeners.push(callback)
    return () => {
      const index = this.detectionListeners.indexOf(callback)
      if (index > -1) {
        this.detectionListeners.splice(index, 1)
      }
    }
  }

  private async getIPLocation(): Promise<LocationData | null> {
    // Try multiple IP services in parallel
    const services = [this.fetchServerAPI(), this.fetchIPAPI(), this.fetchFreeGeoIP()]

    const results = await Promise.allSettled(services)

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        return result.value
      }
    }

    return null
  }

  private async fetchServerAPI(): Promise<LocationData | null> {
    try {
      const response = await fetch("/api/location", {
        signal: AbortSignal.timeout(3000),
      })

      if (!response.ok) return null

      const result = await response.json()
      console.log("Server API raw response:", result)
      if (result.success && result.data) {
        let locationData: LocationData = {
          city: result.data.city,
          country: result.data.country,
          state: result.data.state,
          region: result.data.region,
          postal: result.data.postal,
          address: result.data.address,
          lat: Number.parseFloat(result.data.lat) || 0,
          lon: Number.parseFloat(result.data.lon) || 0,
          timezone: result.data.timezone,
          accuracy: "IP-based (server)",
        }

        console.log("Server API processed location data:", locationData)

        // Validate and enhance location data
        locationData = this.validateAndEnhanceLocation(locationData, "Server API")

        return locationData
      }
    } catch (error) {
      console.warn("Server API failed:", error)
    }
    return null
  }

  private async fetchIPAPI(): Promise<LocationData | null> {
    try {
      const response = await fetch("https://ip-api.com/json/", {
        signal: AbortSignal.timeout(3000),
      })

      if (!response.ok) return null

      const data = await response.json()
      console.log("IPAPI raw response:", data)
      if (data.city && data.country) {
        let locationData: LocationData = {
          city: data.city,
          country: data.country,
          state: data.region,
          region: data.region_code,
          postal: data.postal,
          address: `${data.city}, ${data.region ? data.region + ", " : ""}${data.country}`,
          lat: Number.parseFloat(data.latitude) || 0,
          lon: Number.parseFloat(data.longitude) || 0,
          timezone: data.timezone,
          accuracy: "IP-based",
        }

        console.log("IPAPI processed location data:", locationData)

        // Validate and enhance location data
        locationData = this.validateAndEnhanceLocation(locationData, "IPAPI")

        return locationData
      }
    } catch (error) {
      console.warn("IPAPI failed:", error)
    }
    return null
  }

  private async fetchFreeGeoIP(): Promise<LocationData | null> {
    try {
      const response = await fetch("https://freegeoip.app/json/", {
        signal: AbortSignal.timeout(3000),
      })

      if (!response.ok) return null

      const data = await response.json()
      console.log("FreeGeoIP raw response:", data)
      if (data.city && data.country_name) {
        let locationData: LocationData = {
          city: data.city,
          country: data.country_name,
          state: data.region_name,
          region: data.region_code,
          postal: data.zip_code,
          address: `${data.city}, ${data.region_name ? data.region_name + ", " : ""}${data.country_name}`,
          lat: Number.parseFloat(data.latitude) || 0,
          lon: Number.parseFloat(data.longitude) || 0,
          timezone: data.time_zone,
          accuracy: "IP-based",
        }

        console.log("FreeGeoIP processed location data:", locationData)

        // Validate and enhance location data
        locationData = this.validateAndEnhanceLocation(locationData, "FreeGeoIP")

        return locationData
      }
    } catch (error) {
      console.warn("FreeGeoIP failed:", error)
    }
    return null
  }

  async reverseGeocode(lat: number, lon: number): Promise<LocationData | null> {
    const cacheKey = `reverse:${lat.toFixed(4)},${lon.toFixed(4)}`

    try {
      const response = await fetch(`/api/geocoding?reverse=true&lat=${lat}&lon=${lon}`, {
        signal: AbortSignal.timeout(5000),
        headers: {
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()

        if (data && data.address) {
          const addr = data.address
          const city = addr.city || addr.town || addr.village || addr.hamlet

          // If we have a proper city name, use it
          if (city && city !== "Unknown City") {
            let locationData: LocationData = {
              city: city,
              country: addr.country || "Unknown Country",
              state: addr.state || addr.province,
              region: addr.region,
              postal: addr.postcode,
              address: `${city}, ${addr.state || addr.province ? (addr.state || addr.province) + ", " : ""}${addr.country || "Unknown Country"}`,
              lat: Number.parseFloat(data.lat),
              lon: Number.parseFloat(data.lon),
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              accuracy: "GPS (high accuracy)",
              quality: 90,
              source: "GPS + Nominatim",
              timestamp: Date.now(),
              confidence: 0.9,
            }

            // Validate and enhance location data
            locationData = this.validateAndEnhanceLocation(locationData, "GPS + Nominatim")

            // Also cache in location cache
            locationCache.setLocation(cacheKey, locationData, "GPS + Nominatim")
            return locationData
          }
        }
      }
    } catch (error) {
      console.log("Reverse geocoding failed, falling back to location database:", error)
    }

    try {
      const nearestCity = this.locationDatabase.findNearestCity(lat, lon, 500) // 500km radius

      if (nearestCity) {
        let locationData: LocationData = {
          city: nearestCity.name,
          country: nearestCity.country,
          state: nearestCity.state,
          region: nearestCity.region,
          address: `${nearestCity.name}, ${nearestCity.state ? nearestCity.state + ", " : ""}${nearestCity.country}`,
          lat: lat, // Keep original coordinates
          lon: lon,
          timezone: nearestCity.timezone,
          accuracy: "GPS + Database fallback",
          quality: 75, // Lower quality since it's a fallback
          source: "GPS + Database",
          timestamp: Date.now(),
          confidence: 0.7,
        }

        // Validate and enhance location data
        locationData = this.validateAndEnhanceLocation(locationData, "GPS + Database")

        // Cache the fallback result
        locationCache.setLocation(cacheKey, locationData, "GPS + Database")
        return locationData
      }
    } catch (error) {
      console.error("Location database fallback failed:", error)
    }

    return null
  }

  async geocodeLocation(query: string): Promise<LocationData | null> {
    const cacheKey = `geocode:${query.toLowerCase()}`

    // Check intelligent cache first
    const cached = locationCache.get(cacheKey)
    if (cached) {
      return cached as LocationData
    }

    try {
      const response = await fetch(`/api/geocoding?q=${encodeURIComponent(query)}`, {
        signal: AbortSignal.timeout(5000),
        headers: {
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()

        if (data && data.length > 0) {
          const result = data[0]
          const addr = result.address || {}

          let locationData: LocationData = {
            city: addr.city || addr.town || addr.village || result.name || "Unknown City",
            country: addr.country || "Unknown Country",
            state: addr.state || addr.province,
            region: addr.region,
            postal: addr.postcode,
            address: result.display_name,
            lat: Number.parseFloat(result.lat),
            lon: Number.parseFloat(result.lon),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            accuracy: "Geocoded",
            quality: 80,
            source: "Nominatim Geocoding",
            timestamp: Date.now(),
            confidence: 0.8,
          }

          // Validate and enhance location data
          locationData = this.validateAndEnhanceLocation(locationData, "Nominatim Geocoding")

          // Cache with intelligent caching
          locationCache.setLocation(cacheKey, locationData, "Nominatim Geocoding")

          // Also cache by coordinates
          const coordKey = `coords:${locationData.lat.toFixed(4)},${locationData.lon.toFixed(4)}`
          locationCache.setLocation(coordKey, locationData, "Nominatim Geocoding")

          return locationData
        }
      }
    } catch (error) {
      console.log("Geocoding failed:", error)
    }

    try {
      const searchResults = this.locationDatabase.searchLocations(query)
      if (searchResults && searchResults.length > 0) {
        const searchResult = searchResults[0]
        let locationData: LocationData = {
          city: searchResult.name,
          country: searchResult.country,
          state: searchResult.state,
          region: searchResult.region,
          address: `${searchResult.name}, ${searchResult.state ? searchResult.state + ", " : ""}${searchResult.country}`,
          lat: searchResult.coordinates.lat,
          lon: searchResult.coordinates.lng,
          timezone: searchResult.timezone,
          accuracy: "Database search",
          quality: 70,
          source: "Location Database",
          timestamp: Date.now(),
          confidence: 0.7,
        }

        locationData = this.validateAndEnhanceLocation(locationData, "Location Database")
        locationCache.setLocation(cacheKey, locationData, "Location Database")
        return locationData
      }
    } catch (error) {
      console.error("Database search fallback failed:", error)
    }

    return null
  }

  // Get current location with quality information
  getCurrentLocation(): LocationData | null {
    return this.lastDetection
  }

  // Force refresh location
  async refreshLocation(): Promise<LocationData> {
    return this.detectLocation(true)
  }

  // Check if location is stale
  isLocationStale(): boolean {
    if (!this.lastDetection || !this.lastDetection.timestamp) {
      return true
    }
    const age = Date.now() - this.lastDetection.timestamp
    return age > this.cacheTimeout
  }

  // Get offline location data
  getOfflineLocation(): LocationData | null {
    const cacheKey = "current-location"
    const cached = locationCache.get(cacheKey)
    if (cached) {
      return cached as LocationData
    }

    // Try to get any cached location data
    const stats = locationCache.getStats()
    if (stats.size > 0) {
      const keys = locationCache.keys()
      for (const key of keys) {
        if (key.startsWith("coords:") || key === "current-location") {
          const location = locationCache.get(key)
          if (location) {
            return location as LocationData
          }
        }
      }
    }

    return this.getFallbackLocation()
  }

  // Validate and enhance location data
  private validateAndEnhanceLocation(location: LocationData, source: string): LocationData {
    // Sanitize the location data first
    const sanitized = locationValidator.sanitize(location)

    // Validate the sanitized data
    const validation = locationValidator.validate(sanitized)

    // Calculate quality score based on source and validation
    const qualityScore = locationValidator.calculateQualityScore(sanitized, source)

    return {
      ...sanitized,
      quality: qualityScore,
      confidence: validation.confidence,
      source: source,
      timestamp: Date.now(),
    }
  }

  // Get cache statistics for debugging
  getCacheStats() {
    return locationCache.getStats()
  }

  // Clear all cached location data
  clearCache(): void {
    locationCache.clear()
    this.lastDetection = null
  }

  // Preload location data for better performance
  async preloadLocationData(locations: string[]): Promise<void> {
    const promises = locations.map(async (location) => {
      try {
        await this.geocodeLocation(location)
      } catch (error) {
        console.warn(`Failed to preload location: ${location}`, error)
      }
    })

    await Promise.allSettled(promises)
  }

  private getFallbackLocation(): LocationData {
    return {
      city: "New York",
      country: "United States",
      state: "NY",
      region: "NY",
      postal: "10001",
      address: "New York, NY, United States",
      lat: 40.7128,
      lon: -74.006,
      timezone: "America/New_York",
      accuracy: "Fallback",
      quality: 10,
      source: "Fallback",
      timestamp: Date.now(),
      confidence: 0.1,
    }
  }
}

export const locationService = new LocationService()
export type { LocationData }
