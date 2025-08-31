import { NextRequest, NextResponse } from 'next/server'

interface TimezoneData {
  timezone: string
  offset: number
  dst: boolean
  abbreviation: string
  country?: string
  city?: string
  quality: number
  source: string
  timestamp: number
  confidence: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const ip = searchParams.get('ip')

    // Multiple timezone detection strategies
    const strategies = []

    // Strategy 1: Coordinates-based (highest accuracy)
    if (lat && lon) {
      strategies.push(getTimezoneByCoordinates(parseFloat(lat), parseFloat(lon)))
    }

    // Strategy 2: IP-based timezone
    if (ip) {
      strategies.push(getTimezoneByIP(ip))
    }

    // Strategy 3: Browser timezone (fallback)
    strategies.push(getBrowserTimezone())

    // Execute strategies in parallel
    const results = await Promise.allSettled(strategies)
    
    // Find the best result
    let bestResult: TimezoneData | null = null
    let bestScore = 0

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        const score = calculateTimezoneScore(result.value)
        if (score > bestScore) {
          bestScore = score
          bestResult = result.value
        }
      }
    }

    if (bestResult) {
      return NextResponse.json({
        success: true,
        data: bestResult,
        score: bestScore
      })
    }

    // Ultimate fallback
    return NextResponse.json({
      success: true,
      data: {
        timezone: 'America/New_York',
        offset: -5,
        dst: false,
        abbreviation: 'EST',
        quality: 10,
        source: 'Fallback',
        timestamp: Date.now(),
        confidence: 0.1
      },
      score: 10
    })

  } catch (error) {
    console.error('Timezone API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to detect timezone' },
      { status: 500 }
    )
  }
}

async function getTimezoneByCoordinates(lat: number, lon: number): Promise<TimezoneData | null> {
  try {
    // Use multiple timezone APIs for coordinates
    const apis = [
      {
        name: 'timeapi.io',
        url: `https://timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lon}`,
        transform: (data: any) => ({
          timezone: data.timeZone,
          offset: data.currentUtcOffset.seconds / 3600,
          dst: data.hasDayLightSaving,
          abbreviation: data.abbreviation,
          quality: 95,
          source: 'timeapi.io',
          timestamp: Date.now(),
          confidence: 0.95
        })
      },
      {
        name: 'geonames',
        url: `https://api.geonames.org/timezoneJSON?lat=${lat}&lng=${lon}&username=demo`,
        transform: (data: any) => ({
          timezone: data.timezoneId,
          offset: data.rawOffset + (data.dstOffset || 0),
          dst: (data.dstOffset || 0) > 0,
          abbreviation: data.timezoneId.split('/').pop() || 'UTC',
          quality: 90,
          source: 'geonames',
          timestamp: Date.now(),
          confidence: 0.9
        })
      }
    ]

    for (const api of apis) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)
        
        const response = await fetch(api.url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Golden-Hour-Calculator/1.0'
          }
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const data = await response.json()
          if (data && (data.timeZone || data.timezoneId)) {
            return api.transform(data)
          }
        }
      } catch (error) {
        console.log(`${api.name} timezone API failed:`, error)
      }
    }
  } catch (error) {
    console.error('Coordinate-based timezone detection failed:', error)
  }
  return null
}

async function getTimezoneByIP(ip: string): Promise<TimezoneData | null> {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(3000),
      headers: {
        'User-Agent': 'Golden-Hour-Calculator/1.0'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.timezone) {
        return {
          timezone: data.timezone,
          offset: data.utc_offset ? parseFloat(data.utc_offset) : 0,
          dst: false, // IP APIs don't usually provide DST info
          abbreviation: data.timezone.split('/').pop() || 'UTC',
          country: data.country_name,
          city: data.city,
          quality: 70,
          source: 'IP-based',
          timestamp: Date.now(),
          confidence: 0.7
        }
      }
    }
  } catch (error) {
    console.error('IP-based timezone detection failed:', error)
  }
  return null
}

function getBrowserTimezone(): TimezoneData {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const now = new Date()
  const offset = -now.getTimezoneOffset() / 60
  
  return {
    timezone,
    offset,
    dst: isDST(now),
    abbreviation: timezone.split('/').pop() || 'UTC',
    quality: 50,
    source: 'Browser',
    timestamp: Date.now(),
    confidence: 0.5
  }
}

function calculateTimezoneScore(timezone: TimezoneData): number {
  let score = timezone.quality || 0
  
  // Bonus for having country/city info
  if (timezone.country) score += 10
  if (timezone.city) score += 5
  
  // Bonus for DST information
  if (timezone.dst !== undefined) score += 5
  
  // Confidence multiplier
  score *= (timezone.confidence || 0.5)
  
  return Math.min(100, score)
}

function isDST(date: Date): boolean {
  const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset()
  const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset()
  return Math.max(jan, jul) !== date.getTimezoneOffset()
}
