import { NextRequest, NextResponse } from 'next/server'

interface Place {
  id: string
  name: string
  lat: number
  lon: number
  country: string
  state?: string
  type: string
}

// Mock data for popular photography locations
const popularPlaces: Place[] = [
  { id: '1', name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'France', type: 'city' },
  { id: '2', name: 'New York', lat: 40.7128, lon: -74.0060, country: 'USA', state: 'NY', type: 'city' },
  { id: '3', name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan', type: 'city' },
  { id: '4', name: 'London', lat: 51.5074, lon: -0.1278, country: 'UK', type: 'city' },
  { id: '5', name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'Australia', type: 'city' },
  { id: '6', name: 'Dubai', lat: 25.2048, lon: 55.2708, country: 'UAE', type: 'city' },
  { id: '7', name: 'Singapore', lat: 1.3521, lon: 103.8198, country: 'Singapore', type: 'city' },
  { id: '8', name: 'Los Angeles', lat: 34.0522, lon: -118.2437, country: 'USA', state: 'CA', type: 'city' },
  { id: '9', name: 'Barcelona', lat: 41.3851, lon: 2.1734, country: 'Spain', type: 'city' },
  { id: '10', name: 'Rome', lat: 41.9028, lon: 12.4964, country: 'Italy', type: 'city' },
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Filter places based on query
    const results = popularPlaces.filter(place =>
      place.name.toLowerCase().includes(query.toLowerCase()) ||
      place.country.toLowerCase().includes(query.toLowerCase())
    )

    // If no results found in mock data, try geocoding API
    if (results.length === 0) {
      try {
        const geocodeResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
          {
            headers: {
              'User-Agent': 'GoldenHourCalculator/1.0'
            }
          }
        )

        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json()
          const mappedResults = geocodeData.map((item: any) => ({
            id: item.place_id,
            name: item.display_name.split(',')[0],
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            country: item.display_name.split(',').pop()?.trim() || '',
            type: item.type || 'location'
          }))
          return NextResponse.json({ places: mappedResults })
        }
      } catch (error) {
        console.error('Geocoding error:', error)
      }
    }

    return NextResponse.json({ places: results })
  } catch (error) {
    console.error('Error searching places:', error)
    return NextResponse.json(
      { error: 'Failed to search places' },
      { status: 500 }
    )
  }
}