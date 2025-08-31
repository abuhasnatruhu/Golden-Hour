import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🌍 Location API called')
  try {
    // Get client IP with better detection
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const cfConnectingIp = request.headers.get("cf-connecting-ip")
    const xClientIp = request.headers.get("x-client-ip")
    
    const ip = cfConnectingIp || forwarded?.split(",")[0] || realIp || xClientIp || "127.0.0.1"

    console.log("🌍 Detected IP:", ip)

    // Skip location detection for localhost with enhanced fallback
    if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
      const fallbackData = {
        success: true,
        data: {
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
        },
        service: 'fallback'
      }
      console.log('🌍 Returning fallback data:', fallbackData)
      return NextResponse.json(fallbackData)
    }

    // Enhanced IP geolocation services with parallel processing
    const services = [
      {
        name: "ipapi.co",
        url: `https://ipapi.co/${ip}/json/`,
        timeout: 3000
      },
      {
        name: "freegeoip.app",
        url: `https://freegeoip.app/json/${ip}`,
        timeout: 3000
      },
      {
        name: "ip-api.com",
        url: `https://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,query`,
        timeout: 2500
      }
    ]

    for (const service of services) {
      try {
        console.log(`Trying ${service.name}...`)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), service.timeout || 3000)
        
        const response = await fetch(service.url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Golden-Hour-Calculator/1.0'
          },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          console.log(`${service.name} response:`, data)

          // Handle different response formats with enhanced properties
          let locationData = null

          if (service.name === 'ipapi.co' && data.city && data.country) {
            locationData = {
              city: data.city,
              country: data.country,
              state: data.region,
              region: data.region_code,
              postal: data.postal,
              address: `${data.city}, ${data.region ? data.region + ', ' : ''}${data.country}`,
              lat: data.latitude,
              lon: data.longitude,
              timezone: data.timezone,
              accuracy: "IP-based (ipapi.co)",
              quality: 70,
              source: "ipapi.co",
              timestamp: Date.now(),
              confidence: 0.7,
              ip: ip
            }
          } else if (service.name === 'freegeoip.app' && data.city && data.country_name) {
            locationData = {
              city: data.city,
              country: data.country_name,
              state: data.region_name,
              region: data.region_code,
              postal: data.zip_code,
              address: `${data.city}, ${data.region_name ? data.region_name + ', ' : ''}${data.country_name}`,
              lat: data.latitude,
              lon: data.longitude,
              timezone: data.time_zone,
              accuracy: "IP-based (freegeoip.app)",
              quality: 65,
              source: "freegeoip.app",
              timestamp: Date.now(),
              confidence: 0.65,
              ip: ip
            }
          } else if (service.name === 'ip-api.com' && data.status === 'success' && data.city && data.country) {
            locationData = {
              city: data.city,
              country: data.country,
              state: data.regionName,
              region: data.regionName,
              postal: data.zip,
              address: `${data.city}, ${data.regionName ? data.regionName + ', ' : ''}${data.country}`,
              lat: data.lat,
              lon: data.lon,
              timezone: data.timezone,
              accuracy: "IP-based (ip-api.com)",
              quality: 75,
              source: "ip-api.com",
              timestamp: Date.now(),
              confidence: 0.75,
              ip: ip
            }
          }

          if (locationData) {
            console.log('Location detected successfully:', locationData)
            return NextResponse.json({
              success: true,
              data: locationData,
              service: service.name
            })
          }
        }
      } catch (serviceError) {
        console.warn(`${service.name} failed:`, serviceError)
        continue
      }
    }

    // If all services fail, return a fallback location
    console.log('All IP services failed, returning fallback location')
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
      accuracy: "Fallback (demo location)",
      quality: 10,
      source: "Server Fallback",
      timestamp: Date.now(),
      confidence: 0.1,
      ip: ip
    }

    return NextResponse.json({
      success: true,
      data: fallbackLocation,
      service: 'fallback'
    })

  } catch (error) {
    console.error('Error in location API:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to detect location',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
