import { NextRequest, NextResponse } from 'next/server'
import { sunCalculator } from '@/lib/sun-calculator'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const date = searchParams.get('date')

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lon)
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude' },
        { status: 400 }
      )
    }

    const targetDate = date ? new Date(date) : new Date()
    
    // Calculate sun times and golden hour periods
    const sunTimes = sunCalculator.getSunTimes(targetDate, latitude, longitude)
    const goldenHours = sunCalculator.getGoldenHourPeriods(targetDate, latitude, longitude)
    const blueHours = sunCalculator.getBlueHourPeriods(targetDate, latitude, longitude)
    const dayInfo = sunCalculator.getDayInfo(targetDate, latitude, longitude)
    
    const result = {
      sunrise: sunTimes.sunrise,
      sunset: sunTimes.sunset,
      solarNoon: sunTimes.solarNoon,
      goldenHours,
      blueHours,
      daylight: dayInfo.daylightDuration,
      date: targetDate
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error calculating golden hour:', error)
    return NextResponse.json(
      { error: 'Failed to calculate golden hour times' },
      { status: 500 }
    )
  }
}