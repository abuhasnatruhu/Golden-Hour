import { type NextRequest, NextResponse } from "next/server"
import { API_CONFIG } from "@/lib/api-config"

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || API_CONFIG.UNSPLASH.ACCESS_KEY

export async function GET(request: NextRequest) {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      console.error("[v0] Unsplash API key not configured")
      return NextResponse.json({ error: "Unsplash API key not configured" }, { status: 500 })
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
    ].filter(Boolean)

    console.log("[v0] Unsplash API call:", {
      originalQuery: query,
      searchQueries,
      page,
      perPage,
      apiKey: UNSPLASH_ACCESS_KEY ? `${UNSPLASH_ACCESS_KEY.substring(0, 10)}...` : "NOT SET",
    })

    // Try different search queries until we get results
    for (const searchQuery of searchQueries) {
      try {
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&page=${page}&per_page=${perPage}&orientation=landscape`

        console.log("[v0] Trying Unsplash query:", searchQuery)
        console.log("[v0] Unsplash request details:", {
          url,
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY?.substring(0, 10)}...`,
            Accept: "application/json",
            "User-Agent": "GoldenHourCalculator/1.0",
          },
        })

        const response = await fetch(url, {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
            Accept: "application/json",
            "User-Agent": "GoldenHourCalculator/1.0",
          },
        })

        console.log("[v0] Unsplash response status:", response.status)
        console.log("[v0] Unsplash response headers:", Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] Unsplash API error details:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          })

          if (response.status === 429) {
            console.warn("[v0] Unsplash API rate limit exceeded")
            continue // Try next query
          }
          continue // Try next query
        }

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.warn("[v0] Unsplash API returned non-JSON response")
          continue
        }

        const data = await response.json()
        console.log("[v0] Unsplash API success:", {
          query: searchQuery,
          totalResults: data.total,
          resultsCount: data.results?.length || 0,
          firstResult: data.results?.[0]
            ? {
                id: data.results[0].id,
                description: data.results[0].description,
                urls: data.results[0].urls,
              }
            : null,
        })

        // If we got results, return them
        if (data.results && data.results.length > 0) {
          return NextResponse.json(data)
        }
      } catch (error) {
        console.error("[v0] Error with Unsplash query:", searchQuery, error)
        continue // Try next query
      }
    }

    // If no queries returned results, return empty but valid response
    console.warn("[v0] No Unsplash results found for any query variant")
    return NextResponse.json({ results: [], total: 0, total_pages: 0 }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in Unsplash API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
