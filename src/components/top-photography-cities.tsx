"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Star, Trash2 } from "lucide-react"

interface PopularCity {
  id: string
  name: string
  country: string
  lat: number
  lng: number
  timezone: string
  description: string
  bestTime: string
  rating: number
  imageUrl?: string
  photographer?: string
  photographerUrl?: string
}

interface CityImage {
  cityId: string
  imageUrl: string
  thumbnailUrl: string
  photographer: string
  photographerUrl: string
}

interface RecentSearch {
  id: string
  location: string
  lat: number
  lng: number
  searchedAt: Date
  country: string
}

// Helper function to get appropriate gradient backgrounds for each city
const getCityGradient = (cityId: string): string => {
  const gradientMap: Record<string, string> = {
    paris: "from-pink-400 via-purple-500 to-indigo-600", // Romantic pink to purple
    santorini: "from-blue-400 via-cyan-500 to-teal-600", // Ocean blue
    bali: "from-green-400 via-emerald-500 to-teal-600", // Tropical green
    tokyo: "from-red-400 via-pink-500 to-purple-600", // Cherry blossom
    iceland: "from-blue-300 via-indigo-400 to-purple-500", // Northern lights
    dubai: "from-yellow-400 via-orange-500 to-red-600", // Desert sunset
    newyork: "from-gray-400 via-slate-500 to-zinc-600", // Urban steel
    london: "from-gray-300 via-blue-400 to-indigo-500", // Foggy blue
    capetown: "from-orange-400 via-red-500 to-pink-600", // African sunset
    sydney: "from-blue-400 via-teal-500 to-green-600", // Harbor colors
    "machu-picchu": "from-green-500 via-lime-600 to-emerald-700", // Mountain green
    maldives: "from-cyan-300 via-blue-400 to-indigo-500", // Crystal waters
  }
  return gradientMap[cityId] || "from-blue-400 via-purple-500 to-indigo-600" // Default fallback
}

const POPULAR_CITIES: PopularCity[] = [
  {
    id: "paris",
    name: "Paris",
    country: "France",
    lat: 48.8566,
    lng: 2.3522,
    timezone: "Europe/Paris",
    description: "Iconic landmarks and romantic golden hour lighting",
    bestTime: "Evening",
    rating: 4.9,
    imageUrl: "/paris-eiffel-tower-golden-hour-sunset-romantic-lig.png",
    photographer: "Unsplash",
    photographerUrl: "https://unsplash.com",
  },
  {
    id: "santorini",
    name: "Santorini",
    country: "Greece",
    lat: 36.3932,
    lng: 25.4615,
    timezone: "Europe/Athens",
    description: "Stunning sunsets over the Aegean Sea",
    bestTime: "Evening",
    rating: 4.8,
    imageUrl: "/santorini-greece-white-buildings-blue-domes-sunset.png",
    photographer: "Unsplash",
    photographerUrl: "https://unsplash.com",
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    lat: -8.3405,
    lng: 115.092,
    timezone: "Asia/Makassar",
    description: "Tropical paradise with dramatic landscapes",
    bestTime: "Morning",
    rating: 4.7,
    imageUrl: "/bali-indonesia-rice-terraces-tropical-temple-sunri.png",
    photographer: "Unsplash",
    photographerUrl: "https://unsplash.com",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    lat: 35.6762,
    lng: 139.6503,
    timezone: "Asia/Tokyo",
    description: "Urban photography with cherry blossoms",
    bestTime: "Morning",
    rating: 4.6,
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop&crop=center",
    photographer: "Unsplash",
    photographerUrl: "https://unsplash.com",
  },
  {
    id: "iceland",
    name: "Reykjavik",
    country: "Iceland",
    lat: 64.1466,
    lng: -21.9426,
    timezone: "Atlantic/Reykjavik",
    description: "Northern lights and dramatic landscapes",
    bestTime: "Evening",
    rating: 4.8,
    imageUrl: "/iceland-northern-lights-aurora-borealis-dramatic-l.png",
    photographer: "Unsplash",
    photographerUrl: "https://unsplash.com",
  },
  {
    id: "dubai",
    name: "Dubai",
    country: "UAE",
    lat: 25.2048,
    lng: 55.2708,
    timezone: "Asia/Dubai",
    description: "Modern architecture and desert photography",
    bestTime: "Evening",
    rating: 4.5,
    imageUrl: "/dubai-uae-burj-khalifa-modern-skyscrapers-desert-s.png",
    photographer: "Unsplash",
    photographerUrl: "https://unsplash.com",
  },
  {
    id: "newyork",
    name: "New York",
    country: "USA",
    lat: 40.7128,
    lng: -74.006,
    timezone: "America/New_York",
    description: "Iconic skyline and urban street photography",
    bestTime: "Evening",
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop&crop=center",
    photographer: "Unsplash",
    photographerUrl: "https://unsplash.com",
  },
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    lat: 51.5074,
    lng: -0.1278,
    timezone: "Europe/London",
    description: "Historic architecture and Thames riverside views",
    bestTime: "Morning",
    rating: 4.4,
    imageUrl: "/london-england-big-ben-thames-river-tower-bridge-h.png",
    photographer: "Unsplash",
    photographerUrl: "https://unsplash.com",
  },
  {
    id: "capetown",
    name: "Cape Town",
    country: "South Africa",
    lat: -33.9249,
    lng: 18.4241,
    timezone: "Africa/Johannesburg",
    description: "Table Mountain and stunning coastal landscapes",
    bestTime: "Evening",
    rating: 4.8,
    imageUrl: "/cape-town-south-africa-table-mountain-coastal-land.png",
    photographer: "Unsplash",
    photographerUrl: "https://unsplash.com",
  },
  {
    id: "sydney",
    name: "Sydney",
    country: "Australia",
    lat: -33.8688,
    lng: 151.2093,
    timezone: "Australia/Sydney",
    description: "Opera House and harbor bridge photography",
    bestTime: "Morning",
    rating: 4.6,
    imageUrl: "/sydney-australia-opera-house-harbor-bridge-waterfr.png",
    photographer: "Unsplash",
    photographerUrl: "https://unsplash.com",
  },
  {
    id: "machu-picchu",
    name: "Machu Picchu",
    country: "Peru",
    lat: -13.1631,
    lng: -72.545,
    timezone: "America/Lima",
    description: "Ancient ruins with mystical mountain backdrop",
    bestTime: "Morning",
    rating: 4.9,
    imageUrl: "/machu-picchu-peru-ancient-ruins-andes-mountains-my.png",
    photographer: "Unsplash",
    photographerUrl: "https://unsplash.com",
  },
  {
    id: "maldives",
    name: "Maldives",
    country: "Maldives",
    lat: 3.2028,
    lng: 73.2207,
    timezone: "Indian/Maldives",
    description: "Crystal clear waters and overwater bungalows",
    bestTime: "Evening",
    rating: 4.8,
    imageUrl: "/maldives-overwater-bungalows-crystal-clear-turquoi.png",
    photographer: "Unsplash",
    photographerUrl: "https://unsplash.com",
  },
]

interface TopPhotographyCitiesProps {
  onCitySelect: (city: {
    lat: number
    lng: number
    address: string
    city: string
    country: string
    timezone: string
  }) => void
}

export function TopPhotographyCities({ onCitySelect }: TopPhotographyCitiesProps) {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem("golden-hour-recent-searches")
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((item: any) => ({
          ...item,
          searchedAt: new Date(item.searchedAt),
        }))
        setRecentSearches(parsed.slice(0, 12)) // Limit to 12 recent searches
      } catch (error) {
        console.error("Error loading recent searches:", error)
      }
    }
  }, []) // Fixed infinite re-rendering by adding empty dependency array

  const saveRecentSearch = (location: string, lat: number, lng: number, country: string) => {
    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      location,
      lat,
      lng,
      country,
      searchedAt: new Date(),
    }

    const updated = [newSearch, ...recentSearches.filter((s) => s.location !== location)].slice(0, 12)
    setRecentSearches(updated)
    localStorage.setItem("golden-hour-recent-searches", JSON.stringify(updated))
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("golden-hour-recent-searches")
  }

  const handleCityClick = (city: PopularCity) => {
    const locationData = {
      lat: city.lat,
      lng: city.lng,
      address: `${city.name}, ${city.country}`,
      city: city.name,
      country: city.country,
      timezone: city.timezone,
    }

    saveRecentSearch(city.name, city.lat, city.lng, city.country)
    onCitySelect(locationData)
  }

  const handleRecentSearchClick = (search: RecentSearch) => {
    const locationData = {
      lat: search.lat,
      lng: search.lng,
      address: `${search.location}, ${search.country}`,
      city: search.location,
      country: search.country,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }

    onCitySelect(locationData)
  }

  const handleImageError = (cityId: string) => {
    console.log(`[v0] Image failed to load for city: ${cityId}`)
    setImageLoadErrors((prev) => new Set([...prev, cityId]))
  }

  const handleImageLoad = (cityId: string) => {
    console.log(`[v0] Image loaded successfully for city: ${cityId}`)
  }

  return (
    <div className="max-w-6xl mx-auto mb-8 space-y-6">
      {/* Popular Photography Cities */}
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Star className="w-5 h-5 text-yellow-500" />
            Top 12 Photography Cities
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Discover the world's most photogenic destinations with perfect golden hour timing
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {POPULAR_CITIES.map((city) => {
              const imageHasError = imageLoadErrors.has(city.id)

              return (
                <div
                  key={city.id}
                  onClick={() => handleCityClick(city)}
                  className="relative group cursor-pointer overflow-hidden rounded-xl aspect-square hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {/* Background Image or Gradient Fallback */}
                  {city.imageUrl && !imageHasError ? (
                    <>
                      <img
                        src={city.imageUrl || "/placeholder.svg"}
                        alt={`${city.name}, ${city.country}`}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                        onError={() => handleImageError(city.id)}
                        onLoad={() => handleImageLoad(city.id)}
                      />
                      {/* Photo Credit */}
                      <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-2 py-1 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <a
                          href={city.photographerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Photo by {city.photographer}
                        </a>
                      </div>
                    </>
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${getCityGradient(city.id)}`} />
                  )}

                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 group-hover:from-black/40 transition-all duration-300" />

                  {/* Content */}
                  <div className="absolute inset-0 p-3 flex flex-col justify-between text-white">
                    {/* Rating */}
                    <div className="flex justify-end">
                      <div className="flex items-center bg-black bg-opacity-50 rounded-full px-2 py-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs ml-1 font-medium">{city.rating}</span>
                      </div>
                    </div>

                    {/* City Info */}
                    <div className="text-center">
                      <h3
                        className="text-sm font-bold mb-1 drop-shadow-lg"
                        style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                      >
                        {city.name}
                      </h3>
                      <p
                        className="text-xs opacity-90 drop-shadow-md"
                        style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.7)" }}
                      >
                        {city.country}
                      </p>
                      <div className="flex items-center justify-center mt-2">
                        <div className="flex items-center bg-black bg-opacity-50 rounded-full px-2 py-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="text-xs" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.6)" }}>
                            {city.bestTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Clock className="w-5 h-5 text-blue-500" />
                Recent Searches
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearRecentSearches}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Quick access to your recently searched locations</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {recentSearches.map((search) => (
                <div
                  key={search.id}
                  onClick={() => handleRecentSearchClick(search)}
                  className="group cursor-pointer p-3 rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 bg-card/30"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-3 h-3 text-primary" />
                    <h4 className="font-medium text-sm text-card-foreground group-hover:text-primary transition-colors truncate">
                      {search.location}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{search.country}</p>
                  <p className="text-xs text-muted-foreground mt-1">{search.searchedAt.toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
