export interface WeatherData {
  temp: number
  condition: string
  description: string
  clouds: number
  visibility: number
  humidity: number
  windSpeed: number
  uvIndex: number
  icon?: string
}

export interface PhotographyConditions {
  goldenHourQuality: "excellent" | "good" | "fair" | "poor"
  blueHourQuality: "excellent" | "good" | "fair" | "poor"
  overallScore: number
  recommendations: string[]
}

export interface WeatherForecast {
  date: string
  temp: number
  condition: string
  description: string
  clouds: number
  windSpeed: number
  humidity: number
}

export interface LocationWeather {
  current: WeatherData
  forecast: WeatherForecast[]
  photographyConditions: PhotographyConditions
}
