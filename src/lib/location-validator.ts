interface ValidationRule {
  name: string
  validate: (data: any) => boolean
  weight: number // 0-1, importance of this rule
  errorMessage: string
}

interface ValidationResult {
  isValid: boolean
  score: number // 0-100
  errors: string[]
  warnings: string[]
  confidence: number // 0-1
}

interface LocationBounds {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

class LocationValidator {
  private rules: ValidationRule[] = []
  private countryBounds: Map<string, LocationBounds> = new Map()

  constructor() {
    this.initializeRules()
    this.initializeCountryBounds()
  }

  private initializeRules(): void {
    this.rules = [
      {
        name: 'validCoordinates',
        validate: (data) => {
          const lat = parseFloat(data.lat)
          const lon = parseFloat(data.lon)
          return !isNaN(lat) && !isNaN(lon) && 
                 lat >= -90 && lat <= 90 && 
                 lon >= -180 && lon <= 180
        },
        weight: 1.0,
        errorMessage: 'Invalid coordinates: latitude must be -90 to 90, longitude must be -180 to 180'
      },
      {
        name: 'hasRequiredFields',
        validate: (data) => {
          return data.city && data.country && 
                 typeof data.city === 'string' && 
                 typeof data.country === 'string' &&
                 data.city.trim().length > 0 && 
                 data.country.trim().length > 0
        },
        weight: 0.9,
        errorMessage: 'Missing required fields: city and country are required'
      },
      {
        name: 'reasonableAccuracy',
        validate: (data) => {
          if (!data.accuracy) return true // Optional field
          return typeof data.accuracy === 'string' && data.accuracy.length > 0
        },
        weight: 0.3,
        errorMessage: 'Invalid accuracy information'
      },
      {
        name: 'validTimezone',
        validate: (data) => {
          if (!data.timezone) return true // Optional field
          try {
            Intl.DateTimeFormat(undefined, { timeZone: data.timezone })
            return true
          } catch {
            return false
          }
        },
        weight: 0.7,
        errorMessage: 'Invalid timezone identifier'
      },
      {
        name: 'validQuality',
        validate: (data) => {
          if (data.quality === undefined) return true
          const quality = parseFloat(data.quality)
          return !isNaN(quality) && quality >= 0 && quality <= 100
        },
        weight: 0.4,
        errorMessage: 'Quality score must be between 0 and 100'
      },
      {
        name: 'validConfidence',
        validate: (data) => {
          if (data.confidence === undefined) return true
          const confidence = parseFloat(data.confidence)
          return !isNaN(confidence) && confidence >= 0 && confidence <= 1
        },
        weight: 0.4,
        errorMessage: 'Confidence must be between 0 and 1'
      },
      {
        name: 'validTimestamp',
        validate: (data) => {
          if (!data.timestamp) return true
          const timestamp = parseInt(data.timestamp)
          const now = Date.now()
          const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000)
          return !isNaN(timestamp) && timestamp >= oneYearAgo && timestamp <= now + 60000 // Allow 1 minute future
        },
        weight: 0.3,
        errorMessage: 'Invalid timestamp: must be within the last year and not in future'
      },
      {
        name: 'reasonableStringLengths',
        validate: (data) => {
          const checkString = (str: any, maxLength: number) => {
            if (!str) return true
            return typeof str === 'string' && str.length <= maxLength
          }
          
          return checkString(data.city, 100) &&
                 checkString(data.country, 100) &&
                 checkString(data.state, 100) &&
                 checkString(data.region, 100) &&
                 checkString(data.address, 500) &&
                 checkString(data.postal, 20)
        },
        weight: 0.5,
        errorMessage: 'String fields exceed maximum allowed length'
      }
    ]
  }

  private initializeCountryBounds(): void {
    // Add some major country bounds for validation
    this.countryBounds.set('United States', { minLat: 24.396308, maxLat: 71.538800, minLon: -179.148909, maxLon: -66.885444 })
    this.countryBounds.set('Canada', { minLat: 41.676555, maxLat: 83.110626, minLon: -141.000000, maxLon: -52.636291 })
    this.countryBounds.set('United Kingdom', { minLat: 49.959999, maxLat: 58.635, minLon: -7.57216793459, maxLon: 1.68153079591 })
    this.countryBounds.set('Germany', { minLat: 47.270111, maxLat: 55.058347, minLon: 5.866342, maxLon: 15.041896 })
    this.countryBounds.set('France', { minLat: 41.333, maxLat: 51.124, minLon: -5.559, maxLon: 9.662 })
    this.countryBounds.set('Australia', { minLat: -43.634597, maxLat: -10.062805, minLon: 113.338953, maxLon: 153.569469 })
    this.countryBounds.set('Japan', { minLat: 24.396308, maxLat: 45.551483, minLon: 122.933653, maxLon: 153.986672 })
    this.countryBounds.set('India', { minLat: 6.4627, maxLat: 35.513327, minLon: 68.1766451354, maxLon: 97.4025614766 })
    this.countryBounds.set('China', { minLat: 18.197700, maxLat: 53.561000, minLon: 73.499800, maxLon: 134.772800 })
    this.countryBounds.set('Brazil', { minLat: -33.750000, maxLat: 5.264877, minLon: -73.985535, maxLon: -32.391180 })
  }

  validate(locationData: any): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    let totalScore = 0
    let totalWeight = 0

    // Run all validation rules
    for (const rule of this.rules) {
      const isValid = rule.validate(locationData)
      totalWeight += rule.weight
      
      if (isValid) {
        totalScore += rule.weight * 100
      } else {
        if (rule.weight >= 0.8) {
          errors.push(rule.errorMessage)
        } else {
          warnings.push(rule.errorMessage)
        }
      }
    }

    // Additional geographic validation
    if (locationData.country && locationData.lat && locationData.lon) {
      const bounds = this.countryBounds.get(locationData.country)
      if (bounds) {
        const lat = parseFloat(locationData.lat)
        const lon = parseFloat(locationData.lon)
        
        if (lat < bounds.minLat || lat > bounds.maxLat || 
            lon < bounds.minLon || lon > bounds.maxLon) {
          warnings.push(`Coordinates appear to be outside ${locationData.country} boundaries`)
        }
      }
    }

    // Calculate final score
    const score = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0
    const isValid = errors.length === 0
    
    // Calculate confidence based on score and data completeness
    let confidence = score / 100
    
    // Boost confidence for complete data
    const completenessBonus = this.calculateCompleteness(locationData) * 0.2
    confidence = Math.min(1, confidence + completenessBonus)
    
    // Reduce confidence for warnings
    confidence = Math.max(0, confidence - (warnings.length * 0.1))

    return {
      isValid,
      score,
      errors,
      warnings,
      confidence: Math.round(confidence * 100) / 100
    }
  }

  private calculateCompleteness(data: any): number {
    const optionalFields = ['state', 'region', 'postal', 'address', 'timezone', 'accuracy']
    const presentFields = optionalFields.filter(field => 
      data[field] && typeof data[field] === 'string' && data[field].trim().length > 0
    )
    
    return presentFields.length / optionalFields.length
  }

  sanitize(locationData: any): any {
    const sanitized = { ...locationData }

    // Sanitize strings
    const stringFields = ['city', 'country', 'state', 'region', 'postal', 'address', 'timezone', 'accuracy', 'source']
    stringFields.forEach(field => {
      if (sanitized[field] && typeof sanitized[field] === 'string') {
        sanitized[field] = sanitized[field].trim()
        // Remove potentially harmful characters
        sanitized[field] = sanitized[field].replace(/[<>"'&]/g, '')
        // Limit length
        const maxLength = field === 'address' ? 500 : 100
        if (sanitized[field].length > maxLength) {
          sanitized[field] = sanitized[field].substring(0, maxLength)
        }
      }
    })

    // Sanitize numbers
    if (sanitized.lat) {
      sanitized.lat = Math.max(-90, Math.min(90, parseFloat(sanitized.lat)))
    }
    if (sanitized.lon) {
      sanitized.lon = Math.max(-180, Math.min(180, parseFloat(sanitized.lon)))
    }
    if (sanitized.quality) {
      sanitized.quality = Math.max(0, Math.min(100, parseFloat(sanitized.quality)))
    }
    if (sanitized.confidence) {
      sanitized.confidence = Math.max(0, Math.min(1, parseFloat(sanitized.confidence)))
    }

    // Ensure timestamp is reasonable
    if (sanitized.timestamp) {
      const timestamp = parseInt(sanitized.timestamp)
      const now = Date.now()
      const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000)
      
      if (isNaN(timestamp) || timestamp < oneYearAgo || timestamp > now + 60000) {
        sanitized.timestamp = now
      }
    }

    return sanitized
  }

  calculateQualityScore(locationData: any, source: string): number {
    const validation = this.validate(locationData)
    let baseScore = validation.score

    // Adjust score based on source reliability
    const sourceMultipliers: { [key: string]: number } = {
      'GPS': 1.0,
      'Browser Geolocation': 0.95,
      'Nominatim': 0.85,
      'IP Geolocation': 0.6,
      'Fallback': 0.3,
      'Cache': 0.9
    }

    const multiplier = sourceMultipliers[source] || 0.7
    baseScore *= multiplier

    // Bonus for recent data
    if (locationData.timestamp) {
      const age = Date.now() - locationData.timestamp
      const ageInHours = age / (1000 * 60 * 60)
      
      if (ageInHours < 1) {
        baseScore += 5 // Fresh data bonus
      } else if (ageInHours > 24) {
        baseScore -= Math.min(20, ageInHours / 24) // Stale data penalty
      }
    }

    return Math.max(0, Math.min(100, Math.round(baseScore)))
  }

  isLocationReasonable(lat: number, lon: number, expectedCountry?: string): boolean {
    // Basic coordinate validation
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return false
    }

    // Check if coordinates are in ocean (very basic check)
    // This is a simplified check - in production you'd want a more sophisticated approach
    const isLikelyLand = (
      // Exclude some major ocean areas
      !(lat > -60 && lat < 60 && lon > -180 && lon < -30 && Math.abs(lat) < 30) && // Pacific
      !(lat > -60 && lat < 60 && lon > 20 && lon < 180 && Math.abs(lat) < 30) // Indian Ocean
    )

    if (!isLikelyLand) {
      return false
    }

    // If expected country is provided, check bounds
    if (expectedCountry) {
      const bounds = this.countryBounds.get(expectedCountry)
      if (bounds) {
        return lat >= bounds.minLat && lat <= bounds.maxLat &&
               lon >= bounds.minLon && lon <= bounds.maxLon
      }
    }

    return true
  }
}

// Export singleton instance
export const locationValidator = new LocationValidator()
export type { ValidationResult, LocationBounds }
