import { NextRequest, NextResponse } from 'next/server'

interface NearbyPlace {
  id: string
  name: string
  lat: number
  lon: number
  distance: number // in kilometers
  type: string
  description?: string
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Mock data for photography spots
const photographySpots = [
  { id: 'ps1', name: 'Brooklyn Bridge', lat: 40.7061, lon: -73.9969, type: 'landmark', description: 'Iconic bridge perfect for sunrise shots' },
  { id: 'ps2', name: 'Central Park', lat: 40.7829, lon: -73.9654, type: 'park', description: 'Great for nature photography' },
  { id: 'ps3', name: 'Times Square', lat: 40.7580, lon: -73.9855, type: 'landmark', description: 'Vibrant city lights' },
  { id: 'ps4', name: 'Statue of Liberty', lat: 40.6892, lon: -74.0445, type: 'monument', description: 'Historic monument' },
  { id: 'ps5', name: 'Empire State Building', lat: 40.7484, lon: -73.9857, type: 'building', description: 'City skyline views' },
  { id: 'ps6', name: 'Golden Gate Bridge', lat: 37.8199, lon: -122.4783, type: 'landmark', description: 'Stunning bridge views' },
  { id: 'ps7', name: 'Yosemite Valley', lat: 37.7456, lon: -119.5936, type: 'nature', description: 'Natural landscapes' },
  { id: 'ps8', name: 'Grand Canyon', lat: 36.1069, lon: -112.1129, type: 'nature', description: 'Dramatic landscapes' },
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const radius = searchParams.get('radius') || '50' // Default 50km radius

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lon)
    const maxRadius = parseFloat(radius)
    
    if (isNaN(latitude) || isNaN(longitude) || isNaN(maxRadius)) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      )
    }

    // Calculate distances and filter by radius
    const nearbyPlaces: NearbyPlace[] = photographySpots
      .map(spot => ({
        ...spot,
        distance: calculateDistance(latitude, longitude, spot.lat, spot.lon)
      }))
      .filter(spot => spot.distance <= maxRadius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10) // Return top 10 nearest places

    // If no nearby places found in mock data, return a generic message
    if (nearbyPlaces.length === 0) {
      return NextResponse.json({
        places: [],
        message: 'No photography spots found within the specified radius. Try increasing the search radius.'
      })
    }

    return NextResponse.json({
      places: nearbyPlaces,
      center: { lat: latitude, lon: longitude },
      radius: maxRadius
    })
  } catch (error) {
    console.error('Error finding nearby places:', error)
    return NextResponse.json(
      { error: 'Failed to find nearby places' },
      { status: 500 }
    )
  }
}