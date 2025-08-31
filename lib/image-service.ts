export interface SearchResult {
  id: string
  title: string
  description?: string
  thumbnail: string
  url: string
  source: "unsplash" | "pexels"
  author: string
  authorUrl: string
}

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

class ImageService {
  private seenImageIds = new Set<string>()
  private readonly UNSPLASH_ACCESS_KEY = "HT7RNqQ_jGXVGcttet8ttcmebRG5wD9qXi3DhZCJnQg"
  private readonly PEXELS_API_KEY = "WxPmRxrHuriDMZQKMU5bTisqn58a9ghq5E0ESWpEN7b8S4jAFmRTOyzY"

  async getLocationImages(location: LocationData, page = 1, limit = 6, bypassCache = false): Promise<SearchResult[]> {
    return this.generatePlaceholderImages(location, limit)
  }

  async getPhotographyInspirationImages(location: LocationData, category: string): Promise<SearchResult[]> {
    return this.generateCategoryPlaceholderImages(location, category, 6)
  }

  private generatePlaceholderImages(location: LocationData, limit: number): SearchResult[] {
    const results: SearchResult[] = []
    const imageTypes = ["landscape", "architecture", "street", "nature", "cityscape", "sunset"]

    for (let i = 0; i < limit; i++) {
      const type = imageTypes[i % imageTypes.length]
      const id = `placeholder-${location.city}-${type}-${i}`

      // Skip if already seen (unless bypassing cache)
      if (this.seenImageIds.has(id)) continue

      results.push({
        id,
        title: `${location.city} ${type}`,
        description: `Beautiful ${type} photography from ${location.city}, ${location.country}`,
        thumbnail: `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(`${location.city} ${type} photography`)}`,
        url: "#",
        source: "unsplash",
        author: "Placeholder Photographer",
        authorUrl: "#",
      })

      this.seenImageIds.add(id)
    }

    return results
  }

  private generateCategoryPlaceholderImages(location: LocationData, category: string, limit: number): SearchResult[] {
    const results: SearchResult[] = []

    for (let i = 0; i < limit; i++) {
      const id = `placeholder-${location.city}-${category}-${i}`

      results.push({
        id,
        title: `${location.city} ${category} photography`,
        description: `Inspiring ${category} photography from ${location.city}, ${location.country}`,
        thumbnail: `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(`${location.city} ${category} photography inspiration`)}`,
        url: "#",
        source: "unsplash",
        author: "Inspiration Photographer",
        authorUrl: "#",
      })
    }

    return results
  }

  resetSeenImages(): void {
    this.seenImageIds.clear()
    console.log("Seen images cache cleared")
  }
}

export const imageService = new ImageService()
export type { LocationData }
