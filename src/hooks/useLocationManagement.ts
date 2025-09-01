import { useState, useCallback } from 'react'
import { locationService, type LocationData } from '@/lib/location-service'
import { weatherService } from '@/lib/weather-service'
import type { PhotographyConditions } from '@/types/weather'

type WeatherData = {
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

export function useLocationManagement() {
  const [autoLocation, setAutoLocation] = useState<LocationData | null>(null)
  const [autoDetecting, setAutoDetecting] = useState(false)
  const [locationError, setLocationError] = useState<string>("")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [photographyConditions, setPhotographyConditions] = useState<PhotographyConditions | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)

  const fetchWeatherData = useCallback(async (locationData: LocationData) => {
    setWeatherLoading(true)
    try {
      if (!locationData?.lat || !locationData?.lon ||
          isNaN(locationData.lat) || isNaN(locationData.lon) ||
          locationData.lat < -90 || locationData.lat > 90 ||
          locationData.lon < -180 || locationData.lon > 180) {
        throw new Error("Invalid coordinates for weather data")
      }

      const weather = await weatherService.getWeatherConditions(locationData.lat, locationData.lon)
      const conditions = await weatherService.getPhotographyConditions(locationData.lat, locationData.lon)

      if (weather) {
        const weatherData: WeatherData = {
          temp: weather.temp,
          condition: weather.condition,
          description: weather.description,
          clouds: weather.clouds,
          visibility: weather.visibility,
          humidity: weather.humidity,
          windSpeed: weather.windSpeed,
          uvIndex: weather.uvIndex,
          sunrise: weather.sunrise,
          sunset: weather.sunset,
        }
        setWeatherData(weatherData)
      } else {
        setWeatherData(null)
      }
      setPhotographyConditions(conditions)
    } catch (error) {
      console.error("Error fetching weather data:", error)
      setWeatherData(null)
      setPhotographyConditions(null)
    } finally {
      setWeatherLoading(false)
    }
  }, [])

  const autoDetectLocation = useCallback(async (onSuccess?: (location: LocationData) => void) => {
    setAutoDetecting(true)
    setLocationError("")

    try {
      const location = await locationService.detectLocation()
      
      if (!location || !location.lat || !location.lon) {
        const fallbackLocation: LocationData = {
          address: "New York, NY, USA",
          city: "New York",
          country: "United States",
          lat: 40.7128,
          lon: -74.006,
          timezone: "America/New_York",
          accuracy: "Fallback",
          quality: 10,
          source: "Fallback",
          timestamp: new Date().getTime(),
          confidence: 0.1,
        }

        setAutoLocation(fallbackLocation)
        setLocationError("Unable to detect location automatically. Using New York as default location.")
        if (onSuccess) onSuccess(fallbackLocation)
        return
      }

      setAutoLocation(location)
      fetchWeatherData(location)
      if (onSuccess) onSuccess(location)
    } catch (error) {
      const fallbackLocation: LocationData = {
        address: "New York, NY, USA",
        city: "New York",
        country: "United States",
        lat: 40.7128,
        lon: -74.006,
        timezone: "America/New_York",
        accuracy: "Fallback",
        quality: 10,
        source: "Fallback",
        timestamp: new Date().getTime(),
        confidence: 0.1,
      }

      setAutoLocation(fallbackLocation)
      setLocationError("Unable to detect location automatically. Using New York as default location.")
      if (onSuccess) onSuccess(fallbackLocation)
    } finally {
      setAutoDetecting(false)
    }
  }, [fetchWeatherData])

  return {
    autoLocation,
    setAutoLocation,
    autoDetecting,
    locationError,
    setLocationError,
    weatherData,
    photographyConditions,
    weatherLoading,
    fetchWeatherData,
    autoDetectLocation,
  }
}