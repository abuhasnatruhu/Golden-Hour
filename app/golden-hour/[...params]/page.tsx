import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { parseDateFromURL, parseEnhancedURL } from "@/lib/url-utils"
import GoldenHourMainPage from "@/app/page"

interface PageProps {
  params: Promise<{
    params: string[]
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { params: urlParams } = await params

  // Parse URL using the enhanced parser
  const parsedURL = parseEnhancedURL(`/golden-hour/${urlParams.join("/")}`)

  if (!parsedURL.lat && !parsedURL.lng && !parsedURL.locationName) {
    return {
      title: "Golden Hour Calculator",
      description: "Calculate perfect golden hour and blue hour times for photography",
    }
  }

  const { locationName, lat, lng, date } = parsedURL
  const parsedDate = date ? parseDateFromURL(date) : new Date()

  const title = locationName
    ? `Golden Hour in ${locationName} | Photography Calculator`
    : lat && lng
      ? `Golden Hour at ${lat.toFixed(4)}, ${lng.toFixed(4)} | Photography Calculator`
      : "Golden Hour Calculator"

  const description = locationName
    ? `Calculate perfect golden hour and blue hour times for photography in ${locationName}. Get precise sunrise, sunset, and optimal lighting times${parsedDate ? ` for ${parsedDate.toLocaleDateString()}` : ""}.`
    : lat && lng
      ? `Calculate perfect golden hour and blue hour times for photography at coordinates ${lat.toFixed(4)}, ${lng.toFixed(4)}. Get precise sunrise, sunset, and optimal lighting times${parsedDate ? ` for ${parsedDate.toLocaleDateString()}` : ""}.`
      : "Calculate perfect golden hour and blue hour times for photography"

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function GoldenHourPage({ params }: PageProps) {
  const { params: urlParams } = await params

  console.log("[v0] Dynamic route handler called with urlParams:", urlParams)

  // Decode URL parameters to handle encoded characters like %2C (comma)
  const decodedParams = urlParams.map((param) => decodeURIComponent(param))
  console.log("[v0] Decoded URL params:", decodedParams)

  // Parse URL using the enhanced parser
  const parsedURL = parseEnhancedURL(`/golden-hour/${decodedParams.join("/")}`)
  console.log("[v0] Parsed URL result:", parsedURL)

  if (!parsedURL.lat && !parsedURL.lng && !parsedURL.locationName) {
    console.log("[v0] Redirecting due to invalid URL format")
    redirect("/")
  }

  const { locationName, lat, lng, date } = parsedURL
  const parsedDate = date ? parseDateFromURL(date) : null

  // For city-only URLs, we need to get coordinates from the location service
  const finalLat = lat
  const finalLng = lng
  const finalLocationName = locationName

  // If we have a location name but no coordinates, we'll let the main page handle geocoding
  if (locationName && (!lat || !lng)) {
    const searchParamsObject: Record<string, string> = {
      locationName: locationName,
    }

    // Only add dateParam if it exists and is not null
    if (parsedDate && date) {
      searchParamsObject.dateParam = date
    }

    console.log("[v0] Passing to main page with location name:", searchParamsObject)
    return <GoldenHourMainPage searchParams={searchParamsObject} />
  }

  // If we have coordinates, use them
  if (lat && lng) {
    const searchParamsObject: Record<string, string> = {
      lat: lat.toString(),
      lng: lng.toString(),
      locationName: locationName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    }

    // Only add dateParam if it exists and is not null
    if (parsedDate && date) {
      searchParamsObject.dateParam = date
    }

    console.log("[v0] Passing to main page with coordinates:", searchParamsObject)
    return <GoldenHourMainPage searchParams={searchParamsObject} />
  }

  // Fallback redirect
  console.log("[v0] Fallback redirect to homepage")
  redirect("/")
}
