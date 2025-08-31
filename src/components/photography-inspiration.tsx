"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Lightbulb,
  Camera,
  MapPin,
  Clock,
  Star,
  Heart,
  Share2,
  BookOpen,
  Palette,
  Compass,
  Mountain,
  Building,
  TreePine,
  Waves,
  CameraOff,
  ImageIcon,
  Loader2,
} from "lucide-react"
import { imageService, type SearchResult } from "../lib/image-service"

interface LocationData {
  city: string
  country: string
  state?: string
  region?: string
  postal?: string
  address?: string
  lat: number
  lon: number
  timezone: string
  accuracy?: string
}

interface PhotographyInspirationProps {
  location: LocationData
}

interface InspirationItem {
  id: string
  title: string
  description: string
  category: string
  icon: React.ReactNode
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  timeOfDay: string[]
  equipment: string[]
  tips: string[]
  location: string
  rating: number
  isFavorite: boolean
}

interface LocalSpot {
  name: string
  type: string
  description: string
  distance: string
  bestTime: string
  icon: React.ReactNode
  rating: number
}

export default function PhotographyInspiration({ location }: PhotographyInspirationProps) {
  const [inspirationItems, setInspirationItems] = useState<InspirationItem[]>([])
  const [localSpots, setLocalSpots] = useState<LocalSpot[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [locationImages, setLocationImages] = useState<SearchResult[]>([])
  const [loadingImages, setLoadingImages] = useState<boolean>(true)
  const [imageError, setImageError] = useState<string | null>(null)
  const [refreshCount, setRefreshCount] = useState<number>(0)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)

  useEffect(() => {
    generateInspirationItems()
    generateLocalSpots()
    fetchLocationImages(false)
  }, [location])

  const fetchLocationImages = async (isRefresh = false) => {
    console.log("[v0] Photography Inspiration - fetchLocationImages called", { isRefresh, location: location.city })
    setLoadingImages(true)
    setImageError(null)

    try {
      console.log("[v0] Calling imageService.getLocationImages with:", {
        location: `${location.city}, ${location.country}`,
        page: 1,
        perPage: 6,
        bypassCache: isRefresh,
      })

      const images = await imageService.getLocationImages(location, 1, 6, isRefresh)
      console.log("[v0] Images received:", images.length, "images")
      console.log(
        "[v0] Image details:",
        images.map((img) => ({
          id: img.id,
          source: img.source,
          thumbnail: img.thumbnail,
          title: img.title,
          author: img.author,
        })),
      )

      if (images.length === 0) {
        console.log("[v0] No images returned - checking API configuration")
        setImageError("No images found for this location. The APIs might be unavailable.")
      } else {
        setLocationImages(images)
        console.log("[v0] Successfully set location images")
      }

      if (isRefresh) {
        setRefreshCount((prev) => prev + 1)
        setLastRefreshTime(new Date())

        // Show success feedback
        if (images.length > 0) {
          console.log(`[v0] ✨ Refreshed with ${images.length} new images`)
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching location images:", error)
      setImageError(
        isRefresh
          ? "Failed to refresh images. Please check API configuration."
          : "Failed to load location images. Please check API configuration.",
      )
    } finally {
      setLoadingImages(false)
    }
  }

  const resetSeenImages = async () => {
    try {
      imageService.resetSeenImages()
      setRefreshCount(0)
      setLastRefreshTime(null)
      // Fetch fresh images after reset
      await fetchLocationImages(true)
    } catch (error) {
      console.error("Error resetting seen images:", error)
    }
  }

  const fetchCategoryImages = async (category: string) => {
    try {
      const images = await imageService.getPhotographyInspirationImages(location, category)
      return images
    } catch (error) {
      console.error("Error fetching category images:", error)
      return []
    }
  }

  const generateInspirationItems = () => {
    const items: InspirationItem[] = [
      {
        id: "1",
        title: "Golden Hour Portraits",
        description: "Capture stunning portraits during the warm, soft light of golden hour",
        category: "portrait",
        icon: <Camera className="w-5 h-5" />,
        difficulty: "Intermediate",
        timeOfDay: ["Golden Hour"],
        equipment: ["Camera", "50mm lens", "Reflector"],
        tips: [
          "Position subject with the sun behind you",
          "Use a wide aperture for beautiful bokeh",
          "Capture catchlights in the eyes",
          "Shoot in RAW for better post-processing",
        ],
        location: "Urban parks, beaches, open fields",
        rating: 4.8,
        isFavorite: false,
      },
      {
        id: "2",
        title: "Cityscape Blue Hour",
        description: "Photograph city skylines during the magical blue hour",
        category: "landscape",
        icon: <Building className="w-5 h-5" />,
        difficulty: "Intermediate",
        timeOfDay: ["Blue Hour"],
        equipment: ["Tripod", "Wide-angle lens", "Remote shutter"],
        tips: [
          "Use a tripod for long exposures",
          "Shoot in aperture priority mode",
          "Include interesting foreground elements",
          "Experiment with different compositions",
        ],
        location: "City rooftops, bridges, viewpoints",
        rating: 4.6,
        isFavorite: false,
      },
      {
        id: "3",
        title: "Seascape Long Exposure",
        description: "Create dreamy ocean scenes with long exposure photography",
        category: "seascape",
        icon: <Waves className="w-5 h-5" />,
        difficulty: "Advanced",
        timeOfDay: ["Sunset", "Sunrise"],
        equipment: ["ND filter", "Tripod", "Wide-angle lens"],
        tips: [
          "Use a 10-stop ND filter for silky water",
          "Shoot during golden hour for warm tones",
          "Use a remote shutter to avoid camera shake",
          "Check tide times for safety",
        ],
        location: "Rocky coastlines, beaches, piers",
        rating: 4.7,
        isFavorite: false,
      },
      {
        id: "4",
        title: "Street Photography",
        description: "Capture candid moments and urban life",
        category: "street",
        icon: <CameraOff className="w-5 h-5" />,
        difficulty: "Beginner",
        timeOfDay: ["Golden Hour", "Blue Hour"],
        equipment: ["Prime lens", "Camera", "Comfortable shoes"],
        tips: [
          "Be respectful of people's privacy",
          "Use a prime lens for discretion",
          "Look for interesting characters",
          "Shoot in aperture priority mode",
        ],
        location: "City streets, markets, public spaces",
        rating: 4.3,
        isFavorite: false,
      },
      {
        id: "5",
        title: "Nature Macro",
        description: "Discover the tiny world of macro photography",
        category: "nature",
        icon: <TreePine className="w-5 h-5" />,
        difficulty: "Intermediate",
        timeOfDay: ["Early Morning", "Late Afternoon"],
        equipment: ["Macro lens", "Tripod", "Reflector"],
        tips: [
          "Use a macro lens for close-up details",
          "Shoot during soft light conditions",
          "Use a tripod for sharp images",
          "Focus on the eyes of insects",
        ],
        location: "Gardens, forests, meadows",
        rating: 4.5,
        isFavorite: false,
      },
      {
        id: "6",
        title: "Mountain Landscapes",
        description: "Capture breathtaking mountain vistas",
        category: "landscape",
        icon: <Mountain className="w-5 h-5" />,
        difficulty: "Advanced",
        timeOfDay: ["Sunrise", "Sunset"],
        equipment: ["Wide-angle lens", "Tripod", "Filters"],
        tips: [
          "Use a wide-angle lens for grand views",
          "Include foreground elements for scale",
          "Shoot during golden hour",
          "Check weather conditions before hiking",
        ],
        location: "Mountain viewpoints, hiking trails",
        rating: 4.9,
        isFavorite: false,
      },
    ]

    setInspirationItems(items)
  }

  const generateLocalSpots = () => {
    const spots: LocalSpot[] = [
      {
        name: `${location.city} Downtown`,
        type: "Urban",
        description: "Perfect for street photography and architecture",
        distance: "City center",
        bestTime: "Golden Hour, Blue Hour",
        icon: <Building className="w-5 h-5" />,
        rating: 4.5,
      },
      {
        name: `${location.city} Riverfront`,
        type: "Water",
        description: "Great for sunrise and sunset reflections",
        distance: "2-5 km from center",
        bestTime: "Sunrise, Sunset",
        icon: <Waves className="w-5 h-5" />,
        rating: 4.7,
      },
      {
        name: `${location.city} Park`,
        type: "Nature",
        description: "Beautiful for portraits and nature photography",
        distance: "1-3 km from center",
        bestTime: "Golden Hour",
        icon: <TreePine className="w-5 h-5" />,
        rating: 4.3,
      },
      {
        name: `${location.city} Viewpoint`,
        type: "Landscape",
        description: "Panoramic views of the city and surroundings",
        distance: "5-10 km from center",
        bestTime: "Sunrise, Sunset",
        icon: <Compass className="w-5 h-5" />,
        rating: 4.8,
      },
      {
        name: `${location.city} Historic District`,
        type: "Architecture",
        description: "Charming buildings and cultural heritage",
        distance: "City center",
        bestTime: "Blue Hour",
        icon: <BookOpen className="w-5 h-5" />,
        rating: 4.4,
      },
      {
        name: `${location.city} Botanical Garden`,
        type: "Nature",
        description: "Perfect for macro and flower photography",
        distance: "3-7 km from center",
        bestTime: "Early Morning",
        icon: <Palette className="w-5 h-5" />,
        rating: 4.6,
      },
    ]

    setLocalSpots(spots)
  }

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)

    // Update the item's favorite status
    setInspirationItems((prev) =>
      prev.map((item) => ({
        ...item,
        isFavorite: newFavorites.has(id),
      })),
    )
  }

  const filteredItems =
    selectedCategory === "all"
      ? inspirationItems
      : inspirationItems.filter((item) => item.category === selectedCategory)

  const categories = [
    { id: "all", name: "All", icon: <Camera className="w-4 h-4" /> },
    { id: "portrait", name: "Portrait", icon: <Camera className="w-4 h-4" /> },
    { id: "landscape", name: "Landscape", icon: <Mountain className="w-4 h-4" /> },
    { id: "street", name: "Street", icon: <CameraOff className="w-4 h-4" /> },
    { id: "nature", name: "Nature", icon: <TreePine className="w-4 h-4" /> },
    { id: "seascape", name: "Seascape", icon: <Waves className="w-4 h-4" /> },
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">{rating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Lightbulb className="w-5 h-5 text-primary" />
          Photography Inspiration for {location.city}, {location.country}
        </CardTitle>
        <CardDescription>
          Discover creative photography ideas and beautiful locations near {location.city}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location Images Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Photography Inspiration
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchLocationImages(true)}
                disabled={loadingImages}
                className="text-xs hover:bg-primary/10 transition-all duration-200"
              >
                {loadingImages ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <ImageIcon className="w-3 h-3 mr-1" />
                )}
                Refresh Inspiration
              </Button>

              {refreshCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetSeenImages}
                  disabled={loadingImages}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  title="Reset seen images to allow re-showing previous photos"
                >
                  Reset ({refreshCount})
                </Button>
              )}
            </div>
          </div>

          {/* Refresh info */}
          {lastRefreshTime && (
            <div className="text-xs text-muted-foreground mb-2">
              Last refreshed: {lastRefreshTime.toLocaleTimeString()}
              {refreshCount > 1 && ` • ${refreshCount} refreshes`}
            </div>
          )}

          {loadingImages ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">
                {refreshCount > 0 ? "Finding fresh inspiration..." : "Loading authentic photos..."}
              </span>
            </div>
          ) : imageError ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 text-red-400" />
                <p className="text-red-700 mb-3">{imageError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLocationImages(true)}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {locationImages.map((image, index) => (
                <div
                  key={image.id}
                  className="space-y-2 group animate-in fade-in-0 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative overflow-hidden rounded-lg aspect-square bg-gray-100 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={image.thumbnail || "/placeholder.svg"}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onLoad={(e) => {
                        console.log("[v0] Image loaded successfully:", image.id, image.thumbnail)
                      }}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        console.error("[v0] Image failed to load:", {
                          id: image.id,
                          originalSrc: image.thumbnail,
                          source: image.source,
                          title: image.title,
                        })
                        img.src = "/placeholder.svg?height=400&width=400&text=Image+Unavailable"
                        img.alt = "Image unavailable"
                      }}
                    />

                    {/* Overlay with source badge */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          image.source === "unsplash" ? "bg-black/70 text-white" : "bg-emerald-500/90 text-white"
                        }`}
                      >
                        {image.source === "unsplash" ? "Unsplash" : "Pexels"}
                      </span>
                    </div>

                    {/* Click to view larger */}
                    <div
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 cursor-pointer"
                      onClick={() => window.open(image.url, "_blank")}
                      title="Click to view on source website"
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-white/90 rounded-full p-2">
                          <ImageIcon className="w-4 h-4 text-gray-700" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-foreground leading-tight line-clamp-2">
                      {image.title || "Untitled"}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <span>by</span>
                      <a
                        href={image.authorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {image.author}
                      </a>
                    </div>
                    {image.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{image.description}</p>
                    )}
                    {process.env.NODE_ENV === "development" && (
                      <div className="text-xs text-gray-400 font-mono">
                        {image.source} • {image.id}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state for no images */}
          {!loadingImages && !imageError && locationImages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium mb-2">No inspiration found</p>
              <p className="text-sm">Try refreshing or check your internet connection</p>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="h-8 px-3 text-xs"
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Photography Ideas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Creative Photography Ideas</h3>

          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">{item.icon}</div>
                    <div>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleFavorite(item.id)} className="h-8 w-8 p-0">
                      <Heart className={`w-4 h-4 ${item.isFavorite ? "text-red-500 fill-current" : "text-gray-400"}`} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Share2 className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                    {item.difficulty}
                  </span>
                  {item.timeOfDay.map((time) => (
                    <span key={time} className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {time}
                    </span>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Equipment:</h5>
                    <div className="flex flex-wrap gap-1">
                      {item.equipment.map((eq, index) => (
                        <span key={index} className="text-xs bg-muted px-2 py-1 rounded">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Rating:</h5>
                    {renderStars(item.rating)}
                  </div>
                </div>

                <div className="mt-3">
                  <h5 className="text-sm font-medium text-muted-foreground mb-2">Pro Tips:</h5>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {item.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Best: {item.timeOfDay.join(", ")}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Local Photography Spots */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Best Photography Spots Near {location.city}</h3>

          <div className="grid md:grid-cols-2 gap-4">
            {localSpots.map((spot) => (
              <div key={spot.name} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">{spot.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{spot.name}</h4>
                    <p className="text-sm text-muted-foreground">{spot.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{spot.type}</span>
                  </div>
                  {renderStars(spot.rating)}
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{spot.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{spot.bestTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Click any inspiration photo to view on the source website</p>
          <p>• Click "Refresh Inspiration" to see new location-based photos</p>
          <p>• Click the heart icon to save your favorite photography ideas</p>
          <p>• All spots are within easy reach of {location.city}</p>
          <p>• Always check local regulations and respect private property</p>

          {/* Debug info for development */}
          {process.env.NODE_ENV === "development" && refreshCount > 0 && (
            <div className="pt-2 mt-2 border-t border-border">
              <p className="font-mono">
                Debug: {refreshCount} refreshes • {locationImages.length} current images
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
