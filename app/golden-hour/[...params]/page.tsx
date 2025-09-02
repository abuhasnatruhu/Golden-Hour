import { redirect } from "next/navigation"
import { parseEnhancedURL, parseDateFromURL } from "@/lib/url-utils"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{
    params: string[]
  }>
  searchParams: Promise<Record<string, string | string[]>>
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

export default async function GoldenHourPage({ params, searchParams }: PageProps) {
  const { params: urlParams } = await params
  const resolvedSearchParams = await searchParams

  console.log("[Dynamic Route] URL params:", urlParams)
  console.log("[Dynamic Route] Search params:", resolvedSearchParams)

  // Decode URL parameters to handle encoded characters like %2C (comma)
  const decodedParams = urlParams.map((param) => decodeURIComponent(param))
  console.log("[Dynamic Route] Decoded URL params:", decodedParams)

  // Parse URL using the enhanced parser with search params
  const searchParamsObj = new URLSearchParams()
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    const valueStr = Array.isArray(value) ? value[0] : value
    if (valueStr) {
      searchParamsObj.set(key, valueStr)
    }
  })
  const parsedURL = parseEnhancedURL(`/golden-hour/${decodedParams.join("/")}`, searchParamsObj)
  console.log("[Dynamic Route] Parsed URL result:", parsedURL)

  if (!parsedURL.lat && !parsedURL.lng && !parsedURL.locationName) {
    console.log("[Dynamic Route] Redirecting due to invalid URL format")
    redirect("/")
  }

  const { locationName, lat, lng, date } = parsedURL

  // Build redirect URL to main page with proper search params
  const searchParamsToPass = new URLSearchParams()
  
  if (lat) searchParamsToPass.set("lat", lat.toString())
  if (lng) searchParamsToPass.set("lon", lng.toString()) // Note: using "lon" for consistency with main page
  if (locationName) searchParamsToPass.set("location", locationName)
  if (date) searchParamsToPass.set("date", date)
  
  // Add any additional search params from the original URL
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    const valueStr = Array.isArray(value) ? value[0] : value
    if (valueStr && !searchParamsToPass.has(key)) {
      searchParamsToPass.set(key, valueStr)
    }
  })

  const redirectUrl = `/?${searchParamsToPass.toString()}`
  console.log("[Dynamic Route] Redirecting to:", redirectUrl)
  
  redirect(redirectUrl)
}