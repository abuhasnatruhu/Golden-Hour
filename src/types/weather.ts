export interface WeatherData {
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
}

export interface PhotographyConditions {
  goldenHourQuality: 'excellent' | 'good' | 'fair' | 'poor'
  blueHourQuality: 'excellent' | 'good' | 'fair' | 'poor'
  overallScore: number
  recommendations: string[]
}

export interface WeatherForecast {
  hourly: WeatherData[]
  daily: DailyWeather[]
}

export interface DailyWeather extends WeatherData {
  tempMin: number
  tempMax: number
  date: Date
}

export interface WeatherError {
  code: string
  message: string
  retry: boolean
}
