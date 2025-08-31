// Raw OpenWeatherMap API response structure
interface OpenWeatherMapResponse {
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  weather: {
    id: number
    main: string
    description: string
    icon: string
  }[]
  wind: {
    speed: number
    deg: number
  }
  clouds: {
    all: number
  }
  visibility: number
  uvi?: number
  name: string
  sys: {
    country: string
    sunrise: number
    sunset: number
  }
  alerts?: any[]
}

interface WeatherForecast {
  dt: number
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  weather: {
    id: number
    main: string
    description: string
    icon: string
  }[]
  clouds: {
    all: number
  }
  wind: {
    speed: number
    deg: number
  }
  visibility: number
  pop: number
  dt_txt: string
}

interface WeatherResponse {
  current: OpenWeatherMapResponse
  forecast: WeatherForecast[]
  alerts?: any[]
}

const BASE_URL = "https://api.openweathermap.org/data/2.5"

class WeatherService {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

  private generateCacheKey(lat: number, lon: number): string {
    // Ensure lat and lon are valid numbers before calling toFixed
    const safeLat = typeof lat === "number" && !isNaN(lat) ? lat : 0
    const safeLon = typeof lon === "number" && !isNaN(lon) ? lon : 0
    return `${safeLat.toFixed(4)}_${safeLon.toFixed(4)}`
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION
  }

  async getWeatherData(lat: number, lon: number): Promise<any> {
    console.log("🌤️ WeatherService: getWeatherData called with coordinates:", { lat, lon })

    // Validate coordinates
    if (typeof lat !== "number" || isNaN(lat) || typeof lon !== "number" || isNaN(lon)) {
      console.error("🌤️ WeatherService: Invalid coordinates:", { lat, lon })
      throw new Error("Invalid coordinates provided")
    }

    const cacheKey = this.generateCacheKey(lat, lon)
    const cached = this.cache.get(cacheKey)

    if (cached && this.isCacheValid(cached.timestamp)) {
      console.log("🌤️ WeatherService: Using cached data for:", cacheKey)
      return cached.data
    }

    try {
      console.log("🌤️ WeatherService: Making API call to server route...")

      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }

      const data = await response.json()

      console.log("🌤️ WeatherService: API response received:", data)

      // Cache the result
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now(),
      })

      console.log("🌤️ WeatherService: Data cached successfully")
      return data
    } catch (error) {
      console.error("🌤️ WeatherService: Error fetching weather data:", error)
      throw new Error("Failed to fetch weather data")
    }
  }

  async getWeatherConditions(
    lat: number,
    lon: number,
  ): Promise<{
    temp: number
    condition: string
    description: string
    clouds: number
    visibility: number
    humidity: number
    windSpeed: number
    uvIndex: number
    sunrise: Date
    sunset: Date
  }> {
    try {
      console.log("🌤️ WeatherService: getWeatherConditions called with coordinates:", { lat, lon })

      // Validate coordinates
      if (typeof lat !== "number" || isNaN(lat) || typeof lon !== "number" || isNaN(lon)) {
        throw new Error("Invalid coordinates provided")
      }

      const weather = await this.getWeatherData(lat, lon)

      console.log("🌤️ WeatherService: Raw weather data:", weather)

      const processedData = {
        temp: Math.round(weather.temperature || 0),
        condition: weather.description || "Unknown",
        description: weather.description || "No description",
        clouds: weather.cloudCover || 0,
        visibility: weather.visibility || 0,
        humidity: weather.humidity || 0,
        windSpeed: weather.windSpeed || 0,
        uvIndex: weather.uvIndex || 0,
        sunrise: new Date((weather.sunrise || Date.now() / 1000) * 1000),
        sunset: new Date((weather.sunset || Date.now() / 1000) * 1000),
      }

      console.log("🌤️ WeatherService: Processed weather conditions:", processedData)
      return processedData
    } catch (error) {
      console.error("🌤️ WeatherService: Error getting weather conditions:", error)
      throw new Error("Failed to get weather conditions")
    }
  }

  async getPhotographyConditions(
    lat: number,
    lon: number,
  ): Promise<{
    goldenHourQuality: "excellent" | "good" | "fair" | "poor"
    blueHourQuality: "excellent" | "good" | "fair" | "poor"
    overallScore: number
    recommendations: string[]
  }> {
    try {
      const conditions = await this.getWeatherConditions(lat, lon)

      let goldenHourScore = 100
      let blueHourScore = 100
      const recommendations: string[] = []

      // Cloud cover assessment
      if (conditions.clouds > 75) {
        goldenHourScore -= 40
        blueHourScore -= 30
        recommendations.push("Heavy cloud cover may reduce golden hour intensity")
      } else if (conditions.clouds > 50) {
        goldenHourScore -= 20
        blueHourScore -= 15
        recommendations.push("Moderate clouds may create interesting sky patterns")
      } else if (conditions.clouds > 25) {
        goldenHourScore -= 10
        blueHourScore -= 5
        recommendations.push("Light cloud cover can enhance golden hour colors")
      }

      // Visibility assessment
      if (conditions.visibility < 5) {
        goldenHourScore -= 30
        blueHourScore -= 25
        recommendations.push("Poor visibility may affect image clarity")
      } else if (conditions.visibility < 10) {
        goldenHourScore -= 15
        blueHourScore -= 10
        recommendations.push("Reduced visibility may impact distant subjects")
      }

      // Wind assessment
      if (conditions.windSpeed > 15) {
        goldenHourScore -= 20
        blueHourScore -= 15
        recommendations.push("Strong winds may cause camera shake")
      } else if (conditions.windSpeed > 8) {
        goldenHourScore -= 10
        blueHourScore -= 5
        recommendations.push("Moderate winds - consider using tripod")
      }

      // Humidity assessment
      if (conditions.humidity > 80) {
        goldenHourScore -= 15
        blueHourScore -= 10
        recommendations.push("High humidity may cause haze")
      } else if (conditions.humidity > 60) {
        goldenHourScore -= 5
        blueHourScore -= 5
        recommendations.push("Moderate humidity may add atmospheric effect")
      }

      // Weather condition assessment
      const condition = conditions.condition.toLowerCase()
      if (condition.includes("rain") || condition.includes("drizzle")) {
        goldenHourScore -= 50
        blueHourScore -= 40
        recommendations.push("Rain expected - consider protective gear")
      } else if (condition.includes("snow")) {
        goldenHourScore -= 30
        blueHourScore -= 25
        recommendations.push("Snow may create unique lighting opportunities")
      } else if (condition.includes("fog") || condition.includes("mist")) {
        goldenHourScore -= 25
        blueHourScore -= 20
        recommendations.push("Fog conditions may create atmospheric effects")
      } else if (condition.includes("clear")) {
        recommendations.push("Clear skies expected for optimal golden hour")
      }

      // Ensure scores don't go below 0
      goldenHourScore = Math.max(0, goldenHourScore)
      blueHourScore = Math.max(0, blueHourScore)

      const getQuality = (score: number): "excellent" | "good" | "fair" | "poor" => {
        if (score >= 80) return "excellent"
        if (score >= 60) return "good"
        if (score >= 40) return "fair"
        return "poor"
      }

      return {
        goldenHourQuality: getQuality(goldenHourScore),
        blueHourQuality: getQuality(blueHourScore),
        overallScore: Math.round((goldenHourScore + blueHourScore) / 2),
        recommendations,
      }
    } catch (error) {
      console.error("Error getting photography conditions:", error)
      return {
        goldenHourQuality: "fair",
        blueHourQuality: "fair",
        overallScore: 50,
        recommendations: ["Unable to assess weather conditions"],
      }
    }
  }

  clearCache() {
    this.cache.clear()
  }
}

export const weatherService = new WeatherService()
