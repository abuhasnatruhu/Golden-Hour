interface UnsplashPhoto {
  id: string
  created_at: string
  updated_at: string
  promoted_at?: string
  width: number
  height: number
  color: string
  blur_hash: string
  description?: string
  alt_description?: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
    small_s3: string
  }
  links: {
    self: string
    html: string
    download: string
    download_location: string
  }
  likes: number
  liked_by_user: boolean
  current_user_collections: any[]
  sponsorship?: any
  topic_submissions: any
  user: {
    id: string
    updated_at: string
    username: string
    name: string
    first_name: string
    last_name: string
    twitter_username?: string
    portfolio_url?: string
    bio?: string
    location?: string
    links: {
      self: string
      html: string
      photos: string
      likes: string
      portfolio: string
      following: string
      followers: string
    }
    profile_image: {
      small: string
      medium: string
      large: string
    }
    instagram_username?: string
    total_collections: number
    total_likes: number
    total_photos: number
    accepted_tos: boolean
    for_hire: boolean
    social: {
      instagram_username?: string
      portfolio_url?: string
      twitter_username?: string
      paypal_email?: string
    }
  }
}

interface PexelsPhoto {
  id: number
  width: number
  height: number
  url: string
  photographer: string
  photographer_url: string
  photographer_id: number
  avg_color: string
  src: {
    original: string
    large2x: string
    large: string
    medium: string
    small: string
    portrait: string
    landscape: string
    tiny: string
  }
  liked: boolean
  alt: string
}

interface PexelsResponse {
  total_results: number
  page: number
  per_page: number
  photos: PexelsPhoto[]
  next_page?: string
}

interface SearchResult {
  id: string
  url: string
  downloadUrl: string
  thumbnail: string
  title: string
  description?: string
  author: string
  authorUrl: string
  tags: string[]
  width: number
  height: number
  color: string
  source: "unsplash" | "pexels"
  score?: number
}

class ImageService {
  private cache = new Map<string, { data: SearchResult[]; timestamp: number }>()
  private seenImages = new Set<string>()
  private currentPage = new Map<string, number>()
  private CACHE_DURATION = 30 * 60 * 1000 // 30 minutes
  private REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes
  private MAX_PAGES_PER_QUERY = 10

  private generateCacheKey(query: string, page = 1): string {
    return `${query.toLowerCase()}_${page}`
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION
  }

  private async fetchWithRetry(url: string, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            Accept: "application/json",
            "User-Agent": "GoldenHourCalculator/1.0",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
      } catch (error) {
        if (i === retries - 1) {
          throw error
        }
        console.warn(`Image API retry ${i + 1} failed:`, error)
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }

  private convertPexelsToUnsplashFormat(pexelsPhoto: PexelsPhoto): SearchResult {
    return {
      id: pexelsPhoto.id.toString(),
      url: pexelsPhoto.url,
      downloadUrl: pexelsPhoto.src.original,
      thumbnail: pexelsPhoto.src.medium,
      title: pexelsPhoto.alt || `Photo by ${pexelsPhoto.photographer}`,
      description: pexelsPhoto.alt,
      author: pexelsPhoto.photographer,
      authorUrl: pexelsPhoto.photographer_url,
      tags: [],
      width: pexelsPhoto.width,
      height: pexelsPhoto.height,
      color: pexelsPhoto.avg_color,
      source: "pexels",
    }
  }

  private convertUnsplashToSearchResult(unsplashPhoto: UnsplashPhoto): SearchResult {
    return {
      id: unsplashPhoto.id,
      url: unsplashPhoto.links.html,
      downloadUrl: unsplashPhoto.links.download,
      thumbnail: unsplashPhoto.urls.regular,
      title: unsplashPhoto.alt_description || `Photo by ${unsplashPhoto.user.name}`,
      description: unsplashPhoto.description || unsplashPhoto.alt_description,
      author: unsplashPhoto.user.name,
      authorUrl: unsplashPhoto.user.links.html,
      tags: [],
      width: unsplashPhoto.width,
      height: unsplashPhoto.height,
      color: unsplashPhoto.color,
      source: "unsplash",
    }
  }

  async searchUnsplashImages(query: string, page = 1, perPage = 10): Promise<SearchResult[]> {
    try {
      const url = `/api/images/unsplash?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`

      console.log("[v0] Making Unsplash API call:", { url, query, page, perPage })

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 500) {
          console.warn("Unsplash API not configured, returning empty results")
          return []
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Unsplash API response:", data)
      console.log("[v0] Unsplash response details:", {
        totalResults: data.total,
        resultsCount: data.results?.length || 0,
        firstResult: data.results?.[0]
          ? {
              id: data.results[0].id,
              urls: data.results[0].urls,
            }
          : null,
      })

      if (!data.results || !Array.isArray(data.results)) {
        console.warn("Unsplash API returned invalid results format:", data)
        return []
      }

      return data.results.map((photo: UnsplashPhoto) => this.convertUnsplashToSearchResult(photo))
    } catch (error) {
      console.error("Error searching Unsplash images:", error)
      return []
    }
  }

  async searchPexelsImages(query: string, page = 1, perPage = 10): Promise<SearchResult[]> {
    try {
      const url = `/api/images/pexels?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`

      console.log("[v0] Making Pexels API call:", { url, query, page, perPage })

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 500) {
          console.warn("Pexels API not configured, returning empty results")
          return []
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Pexels API response:", data)
      console.log("[v0] Pexels response details:", {
        totalResults: data.total_results,
        photosCount: data.photos?.length || 0,
        firstPhoto: data.photos?.[0]
          ? {
              id: data.photos[0].id,
              src: data.photos[0].src,
            }
          : null,
      })

      if (!data.photos || !Array.isArray(data.photos)) {
        console.warn("Pexels API returned invalid results format:", data)
        return []
      }

      return data.photos.map((photo: PexelsPhoto) => this.convertPexelsToUnsplashFormat(photo))
    } catch (error) {
      console.error("Error searching Pexels images:", error)
      return []
    }
  }

  async getPhotographyInspirationImages(
    location: {
      city: string
      country: string
      state?: string
    },
    category = "landscape",
  ): Promise<SearchResult[]> {
    const categoryQueries = {
      landscape: ["landscape", "nature", "scenic", "vista"],
      portrait: ["portrait", "people", "street photography", "candid"],
      architecture: ["architecture", "buildings", "urban", "cityscape"],
      nature: ["nature", "wildlife", "plants", "outdoors"],
      street: ["street photography", "urban", "city life", "candid"],
      seascape: ["ocean", "beach", "seascape", "coastal", "water"],
    }

    const queries = categoryQueries[category as keyof typeof categoryQueries] || categoryQueries.landscape
    const searchQuery = `${location.city} ${queries[0]}`

    try {
      return await this.getLocationImages(
        {
          ...location,
          lat: 0,
          lon: 0,
        },
        1,
        8,
      )
    } catch (error) {
      console.error("Error getting photography inspiration images:", error)
      return []
    }
  }

  // Enhanced method for getting diverse images on each refresh
  async getLocationImages(
    location: {
      city: string
      country: string
      state?: string
      lat: number
      lon: number
    },
    page = 1,
    perPage = 12,
    bypassCache = false,
  ): Promise<SearchResult[]> {
    const locationKey = `${location.city}_${location.country}`

    // For refresh (bypassCache=true), increment page to get new images
    if (bypassCache) {
      const currentPageNum = this.currentPage.get(locationKey) || 1
      const nextPage = (currentPageNum % this.MAX_PAGES_PER_QUERY) + 1
      this.currentPage.set(locationKey, nextPage)
      page = nextPage
      console.log(`Refreshing images for ${locationKey}, using page ${page}`)
    }

    const cacheKey = this.generateCacheKey(locationKey, page)
    const cached = this.cache.get(cacheKey)

    // Skip cache for refresh or if cache is invalid
    if (!bypassCache && cached && this.isCacheValid(cached.timestamp)) {
      return cached.data
    }

    try {
      const allResults = await this.fetchDiverseImages(location, page, perPage)

      // Filter out previously seen images if refreshing
      let filteredResults = allResults
      if (bypassCache) {
        filteredResults = allResults.filter((result) => !this.seenImages.has(result.id))

        // If we filtered out too many, get more from next page
        if (filteredResults.length < perPage / 2) {
          const additionalResults = await this.fetchDiverseImages(location, page + 1, perPage)
          const additionalFiltered = additionalResults.filter(
            (result) =>
              !this.seenImages.has(result.id) && !filteredResults.some((existing) => existing.id === result.id),
          )
          filteredResults = [...filteredResults, ...additionalFiltered]
        }

        // Remember these images as seen
        filteredResults.forEach((result) => this.seenImages.add(result.id))
      }

      // Limit results
      const finalResults = filteredResults.slice(0, perPage)

      // Cache the results
      if (!bypassCache || finalResults.length > 0) {
        this.cache.set(cacheKey, {
          data: finalResults,
          timestamp: Date.now(),
        })
      }

      return finalResults
    } catch (error) {
      console.error("Error getting location images:", error)
      return []
    }
  }

  private async fetchDiverseImages(
    location: {
      city: string
      country: string
      state?: string
      lat: number
      lon: number
    },
    page: number,
    perPage: number,
  ): Promise<SearchResult[]> {
    const queries = this.generateSmartQueries(location)
    let allResults: SearchResult[] = []
    const resultsPerSource = Math.ceil(perPage / 2)

    console.log("[v0] fetchDiverseImages called with queries:", queries.slice(0, 5))

    // Randomize query selection for diversity
    const shuffledQueries = [...queries].sort(() => Math.random() - 0.5)

    // Try both APIs with different queries for maximum diversity
    const apiCalls: Promise<SearchResult[]>[] = []

    // Unsplash calls
    for (let i = 0; i < Math.min(2, shuffledQueries.length); i++) {
      apiCalls.push(
        this.searchUnsplashImages(shuffledQueries[i], page, Math.ceil(resultsPerSource / 2)).catch((error) => {
          console.warn(`[v0] Unsplash query "${shuffledQueries[i]}" failed:`, error)
          return []
        }),
      )
    }

    // Pexels calls
    for (let i = 0; i < Math.min(2, shuffledQueries.length); i++) {
      const queryIndex = (i + 2) % shuffledQueries.length
      apiCalls.push(
        this.searchPexelsImages(shuffledQueries[queryIndex], page, Math.ceil(resultsPerSource / 2)).catch((error) => {
          console.warn(`[v0] Pexels query "${shuffledQueries[queryIndex]}" failed:`, error)
          return []
        }),
      )
    }

    // Execute all API calls in parallel
    const results = await Promise.all(apiCalls)
    allResults = results.flat()

    console.log("[v0] API results summary:", {
      totalResults: allResults.length,
      sources: allResults.map((r) => r.source),
      hasRealImages: allResults.some((r) => !r.id.includes("placeholder")),
    })

    if (allResults.length === 0) {
      console.log("[v0] No real images found, creating fallback placeholders")
      const categories = ["landscape", "architecture", "street", "nature", "cityscape", "sunset"]
      const placeholders: SearchResult[] = categories.slice(0, perPage).map((category, index) => ({
        id: `placeholder-${location.city}-${category}-${index}`,
        url: `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(`${location.city} ${category} photography`)}`,
        downloadUrl: `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(`${location.city} ${category} photography`)}`,
        thumbnail: `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(`${location.city} ${category} photography`)}`,
        title: `${location.city} ${category}`,
        description: `Beautiful ${category} photography from ${location.city}, ${location.country}`,
        author: "Placeholder Photographer",
        authorUrl: "#",
        tags: [category, location.city.toLowerCase()],
        width: 400,
        height: 300,
        color: "#cccccc",
        source: "unsplash" as const,
      }))

      return placeholders
    }

    // Remove duplicates and score results
    const uniqueResults = allResults
      .filter((result, index, self) => index === self.findIndex((r) => r.id === result.id))
      .map((result) => ({ ...result, score: this.scoreImage(result) }))
      .sort((a, b) => b.score - a.score) // Sort by quality score
      .slice(0, perPage)

    return uniqueResults
  }

  private generateSmartQueries(location: {
    city: string
    country: string
    state?: string
  }): string[] {
    const cityName = location.city
    const countryName = location.country

    // Create English-friendly versions of location names
    const englishCityVariants = [
      cityName,
      cityName === "ঢাকা" ? "Dhaka" : cityName,
      cityName === "ঢাকা" ? "Dhaka Bangladesh" : `${cityName} ${countryName}`,
    ].filter(Boolean)

    const baseQueries: string[] = []

    // Add queries for each city variant
    englishCityVariants.forEach((city) => {
      baseQueries.push(
        `${city} photography`,
        `${city} landscape`,
        `${city} cityscape`,
        `${city} architecture`,
        `${city} street photography`,
        `${city} golden hour`,
        `${city} sunset`,
        `${city} sunrise`,
      )
    })

    // Add country-specific queries
    const countryQueries = [
      `${countryName} landscape`,
      `${countryName} travel photography`,
      `${countryName} scenic`,
      `${countryName} culture`,
      `${countryName} architecture`,
    ]

    // Add generic photography queries as fallback
    const genericQueries = [
      "urban landscape photography",
      "city architecture photography",
      "golden hour cityscape",
      "street photography",
      "sunset landscape",
      "modern city photography",
      "urban photography",
      "architectural photography",
    ]

    return [...baseQueries, ...countryQueries, ...genericQueries]
  }

  private scoreImage(result: SearchResult): number {
    let score = 0

    // Resolution score (higher is better)
    const megapixels = (result.width * result.height) / 1000000
    score += Math.min(megapixels * 10, 50)

    // Aspect ratio score (landscape photos preferred)
    const aspectRatio = result.width / result.height
    if (aspectRatio >= 1.2 && aspectRatio <= 2.0) {
      score += 20
    }

    // Title/description quality
    if (result.description && result.description.length > 10) {
      score += 15
    }

    // Source preference (can be adjusted)
    if (result.source === "unsplash") {
      score += 5
    }

    // Random factor for diversity
    score += Math.random() * 10

    return score
  }

  // Reset seen images periodically to allow re-showing after some time
  resetSeenImages(locationKey?: string) {
    if (locationKey) {
      // Remove only images from specific location
      // This would require tracking which images belong to which location
      // For now, we'll clear all
    }
    this.seenImages.clear()
    console.log("Cleared seen images cache")
  }

  // Clear all caches
  clearCache() {
    this.cache.clear()
    this.seenImages.clear()
    this.currentPage.clear()
  }

  // Get cache statistics for debugging
  getCacheStats() {
    return {
      cachedResults: this.cache.size,
      seenImages: this.seenImages.size,
      trackedLocations: this.currentPage.size,
    }
  }
}

export const imageService = new ImageService()
export type { SearchResult, UnsplashPhoto, PexelsPhoto }
