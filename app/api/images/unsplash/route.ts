import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")
  const page = searchParams.get("page") || "1"
  const perPage = searchParams.get("per_page") || "10"

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY || "HT7RNqQ_jGXVGcttet8ttcmebRG5wD9qXi3DhZCJnQg"

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`

    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      console.error("Unsplash API error:", response.status, response.statusText)
      return NextResponse.json({ error: "Failed to fetch from Unsplash" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching Unsplash images:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
