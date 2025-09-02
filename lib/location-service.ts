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
    // List of IP location services to try in order
    const services = [
      {
        url: "https://ipapi.co/json/",
        name: "ipapi.co"
      },
      {
        url: "https://ipinfo.io/json",
        name: "ipinfo.io"
      },
      {
        url: "https://api.ipgeolocation.io/ipgeo?apiKey=",
        name: "ipgeolocation.io"
      }
    ]

    for (const service of services) {
      try {
        console.log(`Trying IP location service: ${service.name}`)
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        const response = await fetch(service.url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        }).catch((error) => {
          console.warn(`${service.name} network error:`, error.message)
          return null
        })
        
        clearTimeout(timeout)
        
        if (!response) continue
        if (!response.ok) continue

        const data = await response.json()

        // Handle different response formats
        let lat: number, lon: number, city: string, country: string, timezone: string

        if (service.name === "ipapi.co") {
          if (!data.latitude || !data.longitude) continue
          lat = Number.parseFloat(data.latitude)
          lon = Number.parseFloat(data.longitude)
          city = data.city || "Unknown City"
          country = data.country_name || "Unknown Country" 
          timezone = data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
        } else if (service.name === "ipinfo.io") {
          if (!data.loc) continue
          const [latStr, lonStr] = data.loc.split(",")
          lat = Number.parseFloat(latStr)
          lon = Number.parseFloat(lonStr)
          city = data.city || "Unknown City"
          country = data.country || "Unknown Country"
          timezone = data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
        } else {
          // Generic handling
          const latField = data.latitude || data.lat
          const lonField = data.longitude || data.lon || data.lng
          if (!latField || !lonField) continue
          lat = Number.parseFloat(latField)
          lon = Number.parseFloat(lonField)
          city = data.city || "Unknown City"
          country = data.country || data.country_name || "Unknown Country"
          timezone = data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
        }

        // Validate coordinates
        if (isNaN(lat) || isNaN(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
          console.warn(`Invalid coordinates from ${service.name}:`, { lat, lon })
          continue
        }

        console.log(`Successfully got location from ${service.name}:`, { city, country, lat, lon })
        
        return {
          city,
          country,
          state: data.region || data.regionName,
          postal: data.postal || data.zip,
          address: `${city}, ${data.region || ""}, ${country}`.replace(", ,", ",").replace(/^,|,$/, ""),
          lat,
          lon,
          timezone,
          accuracy: `IP-based (${service.name})`,
        }

      } catch (error: any) {
        console.warn(`${service.name} failed:`, error.message || error)
        continue
      }
    }

    // All services failed, return fallback location
    console.warn("All IP location services failed, using fallback location")
    return {
      city: "New York",
      country: "United States", 
      address: "New York, NY, United States",
      lat: 40.7128,
      lon: -74.0060,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      accuracy: "Fallback location"
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
