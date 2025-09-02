import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 })
  }

  // Validate coordinates
  const latitude = parseFloat(lat)
  const longitude = parseFloat(lon)
  
  if (isNaN(latitude) || isNaN(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 })
  }

  const cacheKey = `${latitude.toFixed(2)},${longitude.toFixed(2)}`
  
  // Check cache
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data, { 
      headers: { 
        'X-Cache': 'HIT',
        'Cache-Control': 'public, max-age=600'
      }
    })
  }

  const apiKey = process.env.OPENWEATHER_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "Weather service not configured - missing API key" }, { status: 500 })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`,
      { signal: controller.signal }
    )

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()

    const weatherData = {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind?.speed * 3.6 || 0), // Convert m/s to km/h
      windDirection: data.wind?.deg || 0,
      cloudCover: data.clouds?.all || 0,
      visibility: Math.round((data.visibility || 10000) / 1000), // Convert to km
      pressure: data.main.pressure,
      uvIndex: 0, // Would need UV API for this
      description: data.weather[0]?.description || "Unknown",
      icon: data.weather[0]?.icon || "01d",
      sunrise: new Date((data.sys?.sunrise || Math.floor(Date.now() / 1000)) * 1000),
      sunset: new Date((data.sys?.sunset || Math.floor(Date.now() / 1000)) * 1000),
      temp: Math.round(data.main.temp),
      condition: data.weather[0]?.main || "Unknown",
      clouds: data.clouds?.all || 0,
    }

    // Store in cache
    cache.set(cacheKey, { data: weatherData, timestamp: Date.now() })

    // Clean up old cache entries
    if (cache.size > 100) {
      const entries = Array.from(cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      for (let i = 0; i < 50; i++) {
        cache.delete(entries[i][0])
      }
    }

    return NextResponse.json(weatherData, { 
      headers: { 
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=600'
      }
    })
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 })
    }
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}