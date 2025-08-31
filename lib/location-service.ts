export interface LocationData {
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
}

class LocationService {
  private cache = new Map<string, LocationData>()
  private cacheExpiry = 24 * 60 * 60 * 1000 // 24 hours

  async detectLocation(forceRefresh = false): Promise<LocationData | null> {
    const cacheKey = "auto-location"

    if (!forceRefresh && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) || null
    }

    try {
      // Try geolocation first
      const geoLocation = await this.getGeolocation()
      if (geoLocation) {
        const locationData = await this.reverseGeocode(geoLocation.lat, geoLocation.lng)
        if (locationData) {
          this.cache.set(cacheKey, locationData)
          return locationData
        }
      }

      // Fallback to IP-based location
      const ipLocation = await this.getIPLocation()
      if (ipLocation) {
        this.cache.set(cacheKey, ipLocation)
        return ipLocation
      }

      return null
    } catch (error) {
      console.error("Error detecting location:", error)
      return null
    }
  }

  private getGeolocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => resolve(null),
        { timeout: 10000, enableHighAccuracy: false },
      )
    })
  }

  private async getIPLocation(): Promise<LocationData | null> {
    try {
      const response = await fetch("https://ipapi.co/json/")
      if (!response.ok) throw new Error("IP location failed")

      const data = await response.json()

      return {
        city: data.city || "Unknown City",
        country: data.country_name || "Unknown Country",
        state: data.region,
        postal: data.postal,
        address: `${data.city}, ${data.region}, ${data.country_name}`,
        lat: Number.parseFloat(data.latitude),
        lon: Number.parseFloat(data.longitude),
        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        accuracy: "IP-based",
      }
    } catch (error) {
      console.error("IP location failed:", error)
      return null
    }
  }

  async geocodeLocation(query: string): Promise<LocationData | null> {
    const cacheKey = `geocode-${query}`

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) || null
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
      )

      if (!response.ok) throw new Error("Geocoding failed")

      const results = await response.json()
      if (!results || results.length === 0) return null

      const result = results[0]
      const locationData: LocationData = {
        city: result.address?.city || result.address?.town || result.address?.village || "Unknown City",
        country: result.address?.country || "Unknown Country",
        state: result.address?.state,
        postal: result.address?.postcode,
        address: result.display_name,
        lat: Number.parseFloat(result.lat),
        lon: Number.parseFloat(result.lon),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        accuracy: "Geocoded",
      }

      this.cache.set(cacheKey, locationData)
      return locationData
    } catch (error) {
      console.error("Geocoding error:", error)
      return null
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<LocationData | null> {
    const cacheKey = `reverse-${lat.toFixed(4)}-${lng.toFixed(4)}`

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) || null
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      )

      if (!response.ok) throw new Error("Reverse geocoding failed")

      const result = await response.json()
      if (!result) return null

      const locationData: LocationData = {
        city: result.address?.city || result.address?.town || result.address?.village || "Unknown City",
        country: result.address?.country || "Unknown Country",
        state: result.address?.state,
        postal: result.address?.postcode,
        address: result.display_name,
        lat,
        lon: lng,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        accuracy: "GPS",
      }

      this.cache.set(cacheKey, locationData)
      return locationData
    } catch (error) {
      console.error("Reverse geocoding error:", error)
      return null
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const locationService = new LocationService()
