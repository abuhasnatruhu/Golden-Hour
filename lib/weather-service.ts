export interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: number
  cloudCover: number
  visibility: number
  pressure: number
  uvIndex: number
  description: string
  icon: string
}

export interface PhotographyConditions {
  overall: number // 0-100 score
  lighting: number
  visibility: number
  stability: number
  recommendation: string
  factors: {
    cloudCover: { score: number; description: string }
    visibility: { score: number; description: string }
    wind: { score: number; description: string }
    humidity: { score: number; description: string }
  }
}

class WeatherService {
  async getWeatherConditions(lat: number, lon: number): Promise<WeatherData | null> {
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching weather data:", error)
      return null
    }
  }

  async getPhotographyConditions(lat: number, lon: number): Promise<PhotographyConditions | null> {
    const weather = await this.getWeatherConditions(lat, lon)
    if (!weather) return null

    // Calculate photography condition scores
    const cloudScore = this.calculateCloudScore(weather.cloudCover)
    const visibilityScore = this.calculateVisibilityScore(weather.visibility)
    const windScore = this.calculateWindScore(weather.windSpeed)
    const humidityScore = this.calculateHumidityScore(weather.humidity)

    const overall = Math.round((cloudScore.score + visibilityScore.score + windScore.score + humidityScore.score) / 4)

    let recommendation = "Good conditions for photography"
    if (overall >= 80) recommendation = "Excellent conditions for photography"
    else if (overall >= 60) recommendation = "Good conditions for photography"
    else if (overall >= 40) recommendation = "Fair conditions for photography"
    else recommendation = "Challenging conditions for photography"

    return {
      overall,
      lighting: cloudScore.score,
      visibility: visibilityScore.score,
      stability: windScore.score,
      recommendation,
      factors: {
        cloudCover: cloudScore,
        visibility: visibilityScore,
        wind: windScore,
        humidity: humidityScore,
      },
    }
  }

  private calculateCloudScore(cloudCover: number): { score: number; description: string } {
    if (cloudCover <= 20) return { score: 95, description: "Clear skies - perfect for golden hour" }
    if (cloudCover <= 40) return { score: 85, description: "Mostly clear - excellent conditions" }
    if (cloudCover <= 60) return { score: 70, description: "Partly cloudy - good for dramatic lighting" }
    if (cloudCover <= 80) return { score: 50, description: "Mostly cloudy - diffused lighting" }
    return { score: 30, description: "Overcast - challenging lighting conditions" }
  }

  private calculateVisibilityScore(visibility: number): { score: number; description: string } {
    if (visibility >= 10) return { score: 95, description: "Excellent visibility" }
    if (visibility >= 5) return { score: 80, description: "Good visibility" }
    if (visibility >= 2) return { score: 60, description: "Moderate visibility" }
    if (visibility >= 1) return { score: 40, description: "Poor visibility" }
    return { score: 20, description: "Very poor visibility" }
  }

  private calculateWindScore(windSpeed: number): { score: number; description: string } {
    if (windSpeed <= 10) return { score: 95, description: "Calm conditions - perfect for sharp images" }
    if (windSpeed <= 20) return { score: 80, description: "Light breeze - good conditions" }
    if (windSpeed <= 30) return { score: 60, description: "Moderate wind - may affect stability" }
    if (windSpeed <= 40) return { score: 40, description: "Strong wind - challenging for handheld" }
    return { score: 20, description: "Very windy - tripod recommended" }
  }

  private calculateHumidityScore(humidity: number): { score: number; description: string } {
    if (humidity <= 30) return { score: 70, description: "Low humidity - clear atmosphere" }
    if (humidity <= 50) return { score: 85, description: "Comfortable humidity levels" }
    if (humidity <= 70) return { score: 80, description: "Moderate humidity" }
    if (humidity <= 85) return { score: 60, description: "High humidity - may affect clarity" }
    return { score: 40, description: "Very high humidity - hazy conditions" }
  }
}

export const weatherService = new WeatherService()
