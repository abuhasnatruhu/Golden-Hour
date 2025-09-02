import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")
  const page = searchParams.get("page") || "1"
  const perPage = searchParams.get("per_page") || "10"

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  const apiKey = process.env.PEXELS_API_KEY || "WxPmRxrHuriDMZQKMU5bTisqn58a9ghq5E0ESWpEN7b8S4jAFmRTOyzY"

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`

    const response = await fetch(url, {
      headers: {
        Authorization: apiKey,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      console.error("Pexels API error:", response.status, response.statusText)
      return NextResponse.json({ error: "Failed to fetch from Pexels" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching Pexels images:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
