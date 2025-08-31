export interface LocationParams {
  lat: number
  lng: number
  date?: string
  locationName?: string
  slug?: string
}

export function generateLocationSlug(locationName: string): string {
  let slug = locationName
    .toLowerCase()
    // First, try to transliterate common international characters
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/[ç]/g, "c")
    .replace(/[ß]/g, "ss")
    // Handle common Bengali/Hindi city names
    .replace(/ঢাকা/g, "dhaka")
    .replace(/কলকাতা/g, "kolkata")
    .replace(/মুম্বাই/g, "mumbai")
    .replace(/দিল্লি/g, "delhi")
    // Handle Arabic characters
    .replace(/[أإآ]/g, "a")
    .replace(/[ة]/g, "h")
    // Handle Cyrillic characters
    .replace(/[а]/g, "a")
    .replace(/[е]/g, "e")
    .replace(/[и]/g, "i")
    .replace(/[о]/g, "o")
    .replace(/[у]/g, "u")
    // Remove remaining non-ASCII characters but keep spaces and hyphens
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim()

  if (!slug || slug.length === 0) {
    slug = "location"
  }

  return slug
}

export function parseLocationSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function extractCoordinatesFromSlug(slug: string): { coordinates: string; locationName: string } | null {
  // Look for coordinates pattern in the slug (e.g., "new-york-40.7128--74.0060")
  const match = slug.match(/^(.+?)(-?\d+\.\d+)--(-?\d+\.\d+)$/)
  if (!match) return null

  const locationPart = match[1].replace(/-$/, "") // Remove trailing dash
  const lat = match[2]
  const lng = match[3]

  return {
    coordinates: `${lat},${lng}`,
    locationName: parseLocationSlug(locationPart),
  }
}

export function generateSEOFriendlyURL(params: LocationParams): string {
  const { lat, lng, date, locationName } = params
  const baseUrl = "/golden-hour"

  if (locationName && locationName !== "Location" && !locationName.includes("°")) {
    const slug = generateLocationSlug(locationName)
    const coords = `${lat.toFixed(4)},${lng.toFixed(4)}`

    if (slug && slug !== "location") {
      if (date) {
        // City with coordinates format: /golden-hour/dhaka/23.7644,90.3890/2025-08-28
        return `${baseUrl}/${slug}/${coords}/${date}`
      }
      // City with coordinates format: /golden-hour/dhaka/23.7644,90.3890
      return `${baseUrl}/${slug}/${coords}`
    }
  }

  // Fallback to coordinates only for locations without proper names
  const coords = `${lat.toFixed(4)},${lng.toFixed(4)}`
  if (date) {
    return `${baseUrl}/coordinates/${coords}/${date}`
  }
  return `${baseUrl}/coordinates/${coords}`
}

export function parseCoordinatesFromURL(coordString: string): { lat: number; lng: number } | null {
  const match = coordString.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/)
  if (!match) return null

  const lat = Number.parseFloat(match[1])
  const lng = Number.parseFloat(match[2])

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null
  }

  return { lat, lng }
}

export function parseDateFromURL(dateString: string): Date | null {
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null

  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date
}

export function formatDateForURL(date: Date): string {
  return date.toISOString().split("T")[0]
}

export interface ParsedURLData {
  lat: number | null
  lng: number | null
  date: string | null
  locationName: string | null
}

function isValidDate(dateString: string): boolean {
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return false

  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

// Enhanced URL parsing for the new format: /golden-hour/location/date or /golden-hour/coordinates/lat,lng/date
export function parseEnhancedURL(pathname: string): ParsedURLData {
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length < 2 || segments[0] !== "golden-hour") {
    return { lat: null, lng: null, date: null, locationName: null }
  }

  // Remove 'golden-hour' from segments
  const params = segments.slice(1)

  if (params.length === 0) {
    return { lat: null, lng: null, date: null, locationName: null }
  }

  // Handle city-only format: /golden-hour/dhaka (legacy support)
  if (params.length === 1) {
    const locationSlug = params[0]
    if (locationSlug !== "coordinates") {
      return {
        lat: null,
        lng: null,
        date: null,
        locationName: decodeURIComponent(locationSlug.replace(/-/g, " ")),
      }
    }
  }

  if (params.length === 2) {
    const [first, second] = params

    // City with coordinates: /golden-hour/dhaka/23.7644,90.3890
    if (first !== "coordinates") {
      const coords = parseCoordinatesFromURL(second)
      if (coords) {
        return {
          ...coords,
          date: null,
          locationName: decodeURIComponent(first.replace(/-/g, " ")),
        }
      }

      // Legacy: City with date: /golden-hour/dhaka/2025-08-28
      if (isValidDate(second)) {
        return {
          lat: null,
          lng: null,
          date: second,
          locationName: decodeURIComponent(first.replace(/-/g, " ")),
        }
      }
    }

    // Coordinates format: /golden-hour/coordinates/23.7644,90.3890
    if (first === "coordinates") {
      const coords = parseCoordinatesFromURL(second)
      if (coords) {
        return { ...coords, date: null, locationName: null }
      }
    }
  }

  if (params.length === 3) {
    const [first, second, third] = params

    // City with coordinates and date: /golden-hour/dhaka/23.7644,90.3890/2025-08-28
    if (first !== "coordinates") {
      const coords = parseCoordinatesFromURL(second)
      if (coords && isValidDate(third)) {
        return {
          ...coords,
          date: third,
          locationName: decodeURIComponent(first.replace(/-/g, " ")),
        }
      }
    }

    // Coordinates with date: /golden-hour/coordinates/23.7644,90.3890/2025-08-28
    if (first === "coordinates") {
      const coords = parseCoordinatesFromURL(second)
      if (coords && isValidDate(third)) {
        return { ...coords, date: third, locationName: null }
      }
    }
  }

  // Legacy format support: /golden-hour/dhaka/23.7644,90.3890/2025-08-28
  if (params.length >= 3) {
    const locationSlug = params[0]
    const coordsString = params[1]
    const dateString = params[2]

    const coords = parseCoordinatesFromURL(coordsString)
    if (coords && isValidDate(dateString)) {
      return {
        ...coords,
        date: dateString,
        locationName: decodeURIComponent(locationSlug.replace(/-/g, " ")),
      }
    }
  }

  return { lat: null, lng: null, date: null, locationName: null }
}

// Generate shareable URL for any location
export function generateShareableURL(locationName: string, lat: number, lng: number, date?: Date): string {
  const params: LocationParams = {
    lat,
    lng,
    locationName,
    ...(date && { date: formatDateForURL(date) }),
  }
  return generateSEOFriendlyURL(params)
}

// Comprehensive URL validation
export function validateURL(urlParams: string[]): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Check minimum parameters
  if (urlParams.length < 1) {
    errors.push("URL must have at least one parameter")
    return { isValid: false, errors, warnings }
  }

  // Check if first parameter looks like coordinates (lat,lng format)
  const decodedFirstParam = decodeURIComponent(urlParams[0] || "")
  const firstParamCoordsMatch = decodedFirstParam?.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/)

  let coordinates: string
  let dateIndex: number

  if (urlParams[0] === "coordinates") {
    // Handle /coordinates/lat,lng/date format
    if (urlParams.length < 2) {
      errors.push("Coordinate-only URLs must have coordinates parameter")
      return { isValid: false, errors, warnings }
    }
    coordinates = urlParams[1]
    dateIndex = 2
  } else if (firstParamCoordsMatch) {
    // Handle direct /lat,lng/date format
    coordinates = urlParams[0]
    dateIndex = 1
  } else {
    // Handle /location/lat,lng/date format
    if (urlParams.length < 2) {
      errors.push("URL must have at least location and coordinates parameters")
      return { isValid: false, errors, warnings }
    }

    // Validate location slug (first parameter)
    const locationSlug = urlParams[0]
    if (!/^[a-z0-9-]+$/.test(locationSlug)) {
      errors.push("Location slug must contain only lowercase letters, numbers, and hyphens")
    }
    if (locationSlug.length < 2) {
      errors.push("Location slug must be at least 2 characters long")
    }
    if (locationSlug.length > 100) {
      warnings.push("Location slug is very long, consider shortening for better SEO")
    }

    coordinates = urlParams[1]
    dateIndex = 2
  }

  // Validate coordinates
  // Decode URL-encoded coordinates (handle %2C for comma)
  const decodedCoordinates = decodeURIComponent(coordinates || "")
  const coordsMatch = decodedCoordinates?.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/)
  if (!coordsMatch) {
    errors.push('Coordinates must be in format "lat,lng" (e.g., "23.7644,90.3890")')
  } else {
    const lat = Number.parseFloat(coordsMatch[1])
    const lng = Number.parseFloat(coordsMatch[2])

    if (isNaN(lat) || isNaN(lng)) {
      errors.push("Coordinates must be valid numbers")
    } else {
      if (lat < -90 || lat > 90) {
        errors.push("Latitude must be between -90 and 90 degrees")
      }
      if (lng < -180 || lng > 180) {
        errors.push("Longitude must be between -180 and 180 degrees")
      }

      // Precision warnings
      if (coordsMatch[1].includes(".") && coordsMatch[1].split(".")[1].length > 6) {
        warnings.push("Latitude precision is very high, consider rounding to 4-6 decimal places")
      }
      if (coordsMatch[2].includes(".") && coordsMatch[2].split(".")[1].length > 6) {
        warnings.push("Longitude precision is very high, consider rounding to 4-6 decimal places")
      }
    }
  }

  // Validate date (optional)
  if (urlParams.length > dateIndex && urlParams[dateIndex]) {
    const dateString = urlParams[dateIndex]
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!dateMatch) {
      errors.push('Date must be in format YYYY-MM-DD (e.g., "2025-08-27")')
    } else {
      const year = Number.parseInt(dateMatch[1])
      const month = Number.parseInt(dateMatch[2])
      const day = Number.parseInt(dateMatch[3])

      if (year < 1900 || year > 2100) {
        errors.push("Year must be between 1900 and 2100")
      }
      if (month < 1 || month > 12) {
        errors.push("Month must be between 01 and 12")
      }
      if (day < 1 || day > 31) {
        errors.push("Day must be between 01 and 31")
      }

      // Check if date is valid
      const date = new Date(year, month - 1, day)
      if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        errors.push("Date is not valid (e.g., February 30th does not exist)")
      }

      // Date range warnings
      const now = new Date()
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())

      if (date < oneYearAgo) {
        warnings.push("Date is more than a year in the past")
      }
      if (date > oneYearFromNow) {
        warnings.push("Date is more than a year in the future")
      }
    }
  }

  // Check for extra parameters
  if (urlParams.length > dateIndex + 1) {
    warnings.push("URL has extra parameters that will be ignored")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// Sanitize and normalize URL parameters
export function sanitizeURLParams(urlParams: string[]): string[] {
  return urlParams.map((param, index) => {
    // Check if this parameter is coordinates (either at index 0 or 1)
    const decodedParam = decodeURIComponent(param)
    const coordsMatch = decodedParam.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/)

    if (coordsMatch) {
      // This is coordinates - sanitize and round to 4 decimal places
      const lat = Number.parseFloat(coordsMatch[1]).toFixed(4)
      const lng = Number.parseFloat(coordsMatch[2]).toFixed(4)
      return `${lat},${lng}`
    }

    if (index === 0 && param !== "coordinates") {
      // Sanitize location slug
      return param
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 100)
    }

    return param
  })
}
