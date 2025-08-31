import { NextRequest, NextResponse } from 'next/server'

// Cache for IP-based location data
const locationCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

// Optimized parallel fetch with race condition handling
async function fetchWithTimeout(url: string, timeout: number = 3000): Promise<Response | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Golden-Hour-Calculator/1.0'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get client IP with comprehensive detection
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const cfConnectingIp = request.headers.get("cf-connecting-ip")
    const xClientIp = request.headers.get("x-client-ip")
    
    const ip = cfConnectingIp || forwarded?.split(",")[0] || realIp || xClientIp || "127.0.0.1"

    // Check cache first
    const cached = locationCache.get(ip)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        service: 'cache',
        cached: true
      }, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=1800'
        }
      })
    }

    // Handle localhost and private IPs
    if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
      const fallbackData = {
        city: "New York",
        country: "United States",
        state: "NY",
        region: "NY",
        postal: "10001",
        address: "New York, NY, United States",
        lat: 40.7128,
        lon: -74.006,
        timezone: "America/New_York",
        accuracy: "Fallback (localhost)",
        quality: 10,
        source: "Server Fallback",
        timestamp: Date.now(),
        confidence: 0.1,
        ip: ip
      }
      
      locationCache.set(ip, { data: fallbackData, timestamp: Date.now() })
      
      return NextResponse.json({
        success: true,
        data: fallbackData,
        service: 'fallback'
      })
    }

    // Parallel fetch from multiple services for better reliability
    const services = [
      {
        name: "ipapi.co",
        url: `https://ipapi.co/${ip}/json/`,
        parser: (data: any) => data.city && data.country ? {
          city: data.city,
          country: data.country,
          state: data.region,
          region: data.region_code,
          postal: data.postal,
          address: `${data.city}, ${data.region ? data.region + ', ' : ''}${data.country}`,
          lat: data.latitude,
          lon: data.longitude,
          timezone: data.timezone,
          accuracy: "IP-based",
          quality: 70,
          source: "ipapi.co",
          timestamp: Date.now(),
          confidence: 0.7,
          ip: ip
        } : null
      },
      {
        name: "ip-api.com",
        url: `https://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,query`,
        parser: (data: any) => data.status === 'success' && data.city && data.country ? {
          city: data.city,
          country: data.country,
          state: data.regionName,
          region: data.regionName,
          postal: data.zip,
          address: `${data.city}, ${data.regionName ? data.regionName + ', ' : ''}${data.country}`,
          lat: data.lat,
          lon: data.lon,
          timezone: data.timezone,
          accuracy: "IP-based",
          quality: 75,
          source: "ip-api.com",
          timestamp: Date.now(),
          confidence: 0.75,
          ip: ip
        } : null
      }
    ]

    // Race all services
    const promises = services.map(async (service) => {
      const response = await fetchWithTimeout(service.url, 2500)
      if (response && response.ok) {
        const data = await response.json()
        const parsed = service.parser(data)
        if (parsed) {
          return { data: parsed, service: service.name }
        }
      }
      return null
    })

    // Wait for the first successful response
    const results = await Promise.allSettled(promises)
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        const { data, service } = result.value
        
        // Cache the result
        locationCache.set(ip, { data, timestamp: Date.now() })
        
        // Clean up old cache entries
        if (locationCache.size > 100) {
          const entries = Array.from(locationCache.entries())
          entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
          for (let i = 0; i < 50; i++) {
            locationCache.delete(entries[i][0])
          }
        }
        
        return NextResponse.json({
          success: true,
          data,
          service
        }, {
          headers: {
            'X-Cache': 'MISS',
            'Cache-Control': 'public, max-age=1800'
          }
        })
      }
    }

    // If all services fail, return a fallback location
    const fallbackLocation = {
      city: "New York",
      country: "United States",
      state: "NY",
      region: "NY",
      postal: "10001",
      address: "New York, NY, United States",
      lat: 40.7128,
      lon: -74.0060,
      timezone: "America/New_York",
      accuracy: "Fallback",
      quality: 10,
      source: "Server Fallback",
      timestamp: Date.now(),
      confidence: 0.1,
      ip: ip
    }

    locationCache.set(ip, { data: fallbackLocation, timestamp: Date.now() })

    return NextResponse.json({
      success: true,
      data: fallbackLocation,
      service: 'fallback'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to detect location',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}