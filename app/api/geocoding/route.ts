import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")
  const reverse = searchParams.get("reverse")

  // Handle reverse geocoding (coordinates to location)
  if (reverse === "true" && lat && lon) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Golden Hour Photography App/1.0",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error("Reverse geocoding API error:", error)
      return NextResponse.json({ error: "Failed to fetch location data" }, { status: 500 })
    }
  }

  // Handle forward geocoding (location name to coordinates)
  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' or lat/lon with reverse=true is required" }, { status: 400 })
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query,
    )}&limit=5&addressdetails=1&countrycodes=&dedupe=1&accept-language=en`

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Golden Hour Photography App/1.0",
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Geocoding API error:", error)
    return NextResponse.json({ error: "Failed to fetch location data" }, { status: 500 })
  }
}
