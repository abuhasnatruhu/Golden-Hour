import { locationDatabase } from './location-database'

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
}

/**
 * Utility functions for displaying location information in a user-friendly way
 */
export class LocationDisplayUtils {
  /**
   * Check if a city name looks like coordinates or is invalid
   */
  private static isInvalidCityName(city: string): boolean {
    if (!city || city.trim() === '') return true
    
    // Check for "Unknown City" or similar
    if (city.toLowerCase().includes('unknown')) return true
    
    // Check if it looks like coordinates (contains numbers and commas/periods)
    const coordinatePattern = /^[\d\s.,+-]+$/
    if (coordinatePattern.test(city.trim())) return true
    
    // Check if it's just numbers
    if (/^[\d.,-]+$/.test(city.trim())) return true
    
    return false
  }

  /**
   * Get a proper display name for a location, falling back to database lookup if needed
   */
  static getDisplayName(location: LocationData, isMobile: boolean = false): string {
    // If we have a valid city name, use it
    if (!this.isInvalidCityName(location.city)) {
      const shortFormat = location.country ? `${location.city}, ${location.country}` : location.city
      const fullAddress = location.address
      
      // For mobile, prefer shorter formats
      if (isMobile && fullAddress) {
        return fullAddress.length > 20 ? shortFormat : fullAddress
      }
      
      // For desktop, use full address if available, but truncate if too long
      if (fullAddress && !this.isInvalidCityName(fullAddress)) {
        if (fullAddress.length > 30) {
          return fullAddress.substring(0, 27) + "..."
        }
        return fullAddress
      }
      
      if (location.state && location.country) {
        return `${location.city}, ${location.state}, ${location.country}`
      } else if (location.country) {
        return `${location.city}, ${location.country}`
      }
      return location.city
    }

    // Try to find a better name using the location database
    try {
      const nearestCity = locationDatabase.findNearestCity(location.lat, location.lon, 100) // 100km radius
      if (nearestCity) {
        if (nearestCity.state && nearestCity.country) {
          return `${nearestCity.name}, ${nearestCity.state}, ${nearestCity.country}`
        } else if (nearestCity.country) {
          return `${nearestCity.name}, ${nearestCity.country}`
        }
        return nearestCity.name
      }
    } catch (error) {
      console.warn('Failed to find nearest city:', error)
    }

    // Fallback to address if available
    if (location.address && !this.isInvalidCityName(location.address)) {
      return location.address
    }

    // Last resort: use coordinates with country if available
    if (location.country && !this.isInvalidCityName(location.country)) {
      return `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)} (${location.country})`
    }

    // Absolute fallback
    return `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`
  }

  /**
   * Get a short display name (city, country)
   */
  static getShortDisplayName(location: LocationData): string {
    // If we have a valid city name, use it
    if (!this.isInvalidCityName(location.city)) {
      return location.country ? `${location.city}, ${location.country}` : location.city
    }

    // Try to find a better name using the location database
    try {
      const nearestCity = locationDatabase.findNearestCity(location.lat, location.lon, 100) // 100km radius
      if (nearestCity) {
        return nearestCity.country ? `${nearestCity.name}, ${nearestCity.country}` : nearestCity.name
      }
    } catch (error) {
      console.warn('Failed to find nearest city:', error)
    }

    // Fallback to country if available
    if (location.country && !this.isInvalidCityName(location.country)) {
      return `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)} (${location.country})`
    }

    // Absolute fallback
    return `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`
  }

  /**
   * Get just the city name, with database fallback
   */
  static getCityName(location: LocationData): string {
    // If we have a valid city name, use it
    if (!this.isInvalidCityName(location.city)) {
      return location.city
    }

    // Try to find a better name using the location database
    try {
      const nearestCity = locationDatabase.findNearestCity(location.lat, location.lon, 100) // 100km radius
      if (nearestCity) {
        return nearestCity.name
      }
    } catch (error) {
      console.warn('Failed to find nearest city:', error)
    }

    // Fallback to coordinates
    return `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`
  }

  /**
   * Check if location data has proper city information
   */
  static hasValidCityName(location: LocationData): boolean {
    return !this.isInvalidCityName(location.city)
  }
}

export default LocationDisplayUtils
