import { type NextRequest, NextResponse } from "next/server"
import { API_CONFIG } from "@/lib/api-config"

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || API_CONFIG.PEXELS.API_KEY

export async function GET(request: NextRequest) {
  try {
    if (!PEXELS_API_KEY) {
      console.error("[v0] Pexels API key not configured")
      return NextResponse.json({ error: "Pexels API key not configured" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")
    const page = searchParams.get("page") || "1"
    const perPage = searchParams.get("per_page") || "10"

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    const searchQueries = [
      query,
      query.replace(/[^\w\s]/g, ""), // Remove special characters
      query
        .split(",")[0]
        .trim(), // Just the city name
      `${query.split(",")[0].trim()} city`, // City + "city"
      `${query.split(",")[0].trim()} landscape`, // City + "landscape"
      `${query.split(",")[0].trim()} photography`, // City + "photography"
      "dhaka bangladesh", // Fallback for Dhaka specifically
      "bangladesh landscape", // Country fallback
    ].filter(Boolean)

    console.log("[v0] Pexels API call:", {
      originalQuery: query,
      searchQueries,
      page,
      perPage,
      apiKey: PEXELS_API_KEY ? `${PEXELS_API_KEY.substring(0, 10)}...` : "NOT SET",
    })

    // Try different search queries until we get results
    for (const searchQuery of searchQueries) {
      try {
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&page=${page}&per_page=${perPage}&orientation=landscape`

        console.log("[v0] Trying Pexels query:", searchQuery)
        console.log("[v0] Pexels request details:", {
          url,
          headers: {
            Authorization: `${PEXELS_API_KEY?.substring(0, 10)}...`,
            Accept: "application/json",
            "User-Agent": "GoldenHourCalculator/1.0",
          },
        })

        const response = await fetch(url, {
          headers: {
            Authorization: PEXELS_API_KEY,
            Accept: "application/json",
            "User-Agent": "GoldenHourCalculator/1.0",
          },
        })

        console.log("[v0] Pexels response status:", response.status)
        console.log("[v0] Pexels response headers:", Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] Pexels API error details:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          })

          if (response.status === 429) {
            console.warn("[v0] Pexels API rate limit exceeded")
            continue // Try next query
          }
          continue // Try next query
        }

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.warn("[v0] Pexels API returned non-JSON response")
          continue
        }

        const data = await response.json()
        console.log("[v0] Pexels API success:", {
          query: searchQuery,
          totalResults: data.total_results,
          photosCount: data.photos?.length || 0,
          firstPhoto: data.photos?.[0]
            ? {
                id: data.photos[0].id,
                photographer: data.photos[0].photographer,
                src: data.photos[0].src,
              }
            : null,
        })

        // If we got results, return them
        if (data.photos && data.photos.length > 0) {
          return NextResponse.json(data)
        }
      } catch (error) {
        console.error("[v0] Error with Pexels query:", searchQuery, error)
        continue // Try next query
      }
    }

    // If no queries returned results, return empty but valid response
    console.warn("[v0] No Pexels results found for any query variant")
    return NextResponse.json({ photos: [], total_results: 0, page: 1, per_page: 10 }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in Pexels API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
