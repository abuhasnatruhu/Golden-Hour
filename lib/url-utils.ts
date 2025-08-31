interface URLParams {
  lat: number
  lng: number
  locationName: string
  date: string
}

export function generateSEOFriendlyURL(params: URLParams): string {
  const { lat, lng, locationName, date } = params

  // Clean location name for URL
  const cleanLocationName = locationName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()

  return `/golden-hour/${cleanLocationName}/${date}?lat=${lat}&lng=${lng}`
}

export function formatDateForURL(date: Date): string {
  return date.toISOString().split("T")[0] // YYYY-MM-DD format
}

export function parseDateFromURL(dateStr: string): Date | null {
  try {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

export function parseURLParams(
  pathname: string,
  searchParams: URLSearchParams,
): {
  locationName?: string
  date?: string
  lat?: number
  lng?: number
} | null {
  try {
    const pathParts = pathname.split("/").filter(Boolean)

    if (pathParts[0] !== "golden-hour") return null

    const locationName = pathParts[1]?.replace(/-/g, " ")
    const dateStr = pathParts[2]
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")

    return {
      locationName,
      date: dateStr,
      lat: lat ? Number.parseFloat(lat) : undefined,
      lng: lng ? Number.parseFloat(lng) : undefined,
    }
  } catch {
    return null
  }
}

export function validateCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

export function parseEnhancedURL(pathname: string): {
  locationName?: string
  date?: string
  lat?: number
  lng?: number
} {
  try {
    const pathParts = pathname.split("/").filter(Boolean)
    
    // Skip if not a golden-hour route
    if (pathParts[0] !== "golden-hour") {
      return {}
    }

    // Remove "golden-hour" from the parts
    const params = pathParts.slice(1)
    
    if (params.length === 0) {
      return {}
    }

    // Try to parse different URL formats
    let locationName: string | undefined
    let lat: number | undefined
    let lng: number | undefined
    let date: string | undefined

    // Check if first param contains coordinates (e.g., "23.7644,90.3890")
    const coordPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/
    
    if (params.length === 1) {
      // Single param - could be location name or coordinates
      if (coordPattern.test(params[0])) {
        const [latStr, lngStr] = params[0].split(",")
        lat = parseFloat(latStr)
        lng = parseFloat(lngStr)
      } else {
        locationName = params[0].replace(/-/g, " ")
      }
    } else if (params.length === 2) {
      // Two params - location/coords + date
      if (coordPattern.test(params[0])) {
        const [latStr, lngStr] = params[0].split(",")
        lat = parseFloat(latStr)
        lng = parseFloat(lngStr)
      } else {
        locationName = params[0].replace(/-/g, " ")
      }
      
      // Second param could be coordinates or date
      if (coordPattern.test(params[1])) {
        const [latStr, lngStr] = params[1].split(",")
        lat = parseFloat(latStr)
        lng = parseFloat(lngStr)
      } else {
        date = params[1]
      }
    } else if (params.length >= 3) {
      // Three params - location + coords + date
      locationName = params[0].replace(/-/g, " ")
      
      // Try to parse coordinates from second param
      if (coordPattern.test(params[1])) {
        const [latStr, lngStr] = params[1].split(",")
        lat = parseFloat(latStr)
        lng = parseFloat(lngStr)
      }
      
      // Third param is likely the date
      date = params[2]
    }

    return {
      locationName,
      lat: lat && !isNaN(lat) ? lat : undefined,
      lng: lng && !isNaN(lng) ? lng : undefined,
      date
    }
  } catch (error) {
    console.error("Error parsing URL:", error)
    return {}
  }
}
