"use client"

import { useState, useEffect, useCallback, useRef, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, AlertCircle } from "lucide-react"
import { CompactSearchBar } from "@/components/compact-search-bar"
import { GoldenHourDisplay } from "@/src/components/golden-hour-display"
import { TimeCards } from "@/components/time-cards"
import { ErrorBoundary } from "@/components/error-boundary"
import { weatherService } from "@/lib/weather-service"
import { sunCalculator } from "@/lib/sun-calculator";
import type { PhotographyConditions } from "@/types/weather"
import { locationService, type LocationData } from "@/lib/location-service";
import { SiteHeader } from "@/components/site-header";
import { generateSEOFriendlyURL, formatDateForURL, parseDateFromURL } from "@/lib/url-utils";
import { locationDatabase } from "@/lib/location-database";
import { TopPhotographyCities } from "@/components/top-photography-cities";
import { FloatingNavigation } from "@/components/floating-navigation";
import { SiteFooter } from "@/components/site-footer";
import SEOHead from "@/components/seo-head";
import EnhancedInteractiveMap from "@/components/enhanced-interactive-map";
import PhotographyInspiration from "@/components/photography-inspiration";
import PhotographyCalendar from "@/components/photography-calendar";
import AdvancedPhotographyFeatures from "@/components/advanced-photography-features";
import { StaticFAQ } from "@/components/static-faq"

// Import WeatherData type from types file - extended to match API response
type WeatherData = {
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
  sunrise?: Date
  sunset?: Date
  temp: number
  condition: string
  clouds: number
}

interface GoldenHourTimes {
  sunrise: string
  sunset: string
  goldenHourMorning: {
    start: string
    end: string
  }
  goldenHourEvening: {
    start: string
    end: string
  }
  blueHourMorning: {
    start: string
    end: string
  }
  blueHourEvening: {
    start: string
    end: string
  }
}

interface PageProps {
  searchParams?: Promise<Record<string, string | string[]>>
}

export default function GoldenHourCalculator({ searchParams: propSearchParams }: PageProps) {
  
  const router = useRouter()
  const searchParamsHook = useSearchParams()

  // Handle Next.js 15 searchParams properly
  const hookSearchParams = searchParamsHook instanceof Promise ? use(searchParamsHook) : searchParamsHook

  // Convert propSearchParams to URLSearchParams if it's a plain object
  const normalizedPropSearchParams = propSearchParams
    ? (() => {
        // Handle URLSearchParams case
        if (propSearchParams instanceof URLSearchParams) {
          return propSearchParams
        }

        // Handle Promise case first
        if (propSearchParams instanceof Promise) {
          const unwrapped = use(propSearchParams)
          return unwrapped instanceof URLSearchParams
            ? unwrapped
            : new URLSearchParams(
                Object.entries(unwrapped as Record<string, string | string[]>).map(([key, value]) => [
                  key,
                  Array.isArray(value) ? value[0] : value,
                ]),
              )
        }

        // Handle plain object case
        const params = propSearchParams as Record<string, string | string[]>
        return new URLSearchParams(
          Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
        )
      })()
    : null

  const searchParams = normalizedPropSearchParams || hookSearchParams
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [times, setTimes] = useState<GoldenHourTimes | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [autoLocation, setAutoLocation] = useState<LocationData | null>(null)
  const [nextGoldenHour, setNextGoldenHour] = useState<string>("")
  const [nextGoldenHourTime, setNextGoldenHourTime] = useState<string>("")
  const [nextGoldenHourEndTime, setNextGoldenHourEndTime] = useState<string>("")
  const [nextGoldenHourType, setNextGoldenHourType] = useState<string>("")
  const [nextGoldenHourTargetTime, setNextGoldenHourTargetTime] = useState<Date | null>(null)
  const [nextGoldenHourIsStart, setNextGoldenHourIsStart] = useState<boolean>(true)
  const [autoDetecting, setAutoDetecting] = useState(false)
  const [locationError, setLocationError] = useState<string>("")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [photographyConditions, setPhotographyConditions] = useState<PhotographyConditions | null>(null)
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false)
  const [mounted, setMounted] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const inspirationRef = useRef<HTMLDivElement>(null)
  const citiesRef = useRef<HTMLDivElement>(null)
  const timesRef = useRef<HTMLDivElement>(null)

  // State for URL parameters to trigger useEffect properly
  const [urlParams, setUrlParams] = useState<{
    lat: string | null
    lng: string | null
    locationName: string | null
    dateParam: string | null
  }>({ lat: null, lng: null, locationName: null, dateParam: null })

  // Initialize client-side state and URL parameters
  useEffect(() => {
    setIsClient(true)
    setCurrentTime(new Date())
    setMounted(true)
    
    // Extract URL parameters on client side
    const urlSearchParams = new URLSearchParams(window.location.search)
    const lat = urlSearchParams.get("lat")
    const lng = urlSearchParams.get("lng") || urlSearchParams.get("lon")
    const locationName = urlSearchParams.get("locationName") || urlSearchParams.get("location")
    const dateParam = urlSearchParams.get("dateParam") || urlSearchParams.get("date")
    
    setUrlParams({ lat, lng, locationName, dateParam })
  }, [])

  // Extract values from state for easier access
  const { lat, lng, locationName, dateParam } = urlParams

  // Store timezone separately to avoid re-renders
  const timezone = autoLocation?.timezone

  // Removed - merged with main initialization useEffect above

  useEffect(() => {
    if (!isClient) return
    
    const updateTime = () => {
      const now = new Date()
      if (timezone) {
        const locationTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }))
        setCurrentTime(locationTime)
      } else {
        setCurrentTime(now)
      }
    }

    updateTime()

    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [timezone, isClient])

  // Update countdown display when currentTime changes
  useEffect(() => {
    if (autoLocation && nextGoldenHourTargetTime && currentTime) {
      const now = currentTime
      const selectedDate = date ? new Date(date) : new Date(now.toISOString().split("T")[0])
      const today = new Date(now.toDateString())
      const isToday = selectedDate.getTime() === today.getTime()
      
      if (isToday) {
        const timeUntil = Math.ceil((nextGoldenHourTargetTime.getTime() - now.getTime()) / (1000 * 60))
        
        if (timeUntil < 0) {
          // Golden hour has passed for today
          setNextGoldenHour("Tomorrow")
        } else if (timeUntil === 0) {
          setNextGoldenHour("Now!")
        } else if (timeUntil < 60) {
          if (nextGoldenHourIsStart) {
            setNextGoldenHour(`starts in ${timeUntil} minute${timeUntil !== 1 ? 's' : ''}`)
          } else {
            setNextGoldenHour(`ends in ${timeUntil} minute${timeUntil !== 1 ? 's' : ''}`)
          }
        } else {
          const hours = Math.floor(timeUntil / 60)
          const minutes = timeUntil % 60
          const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} minutes`
          if (nextGoldenHourIsStart) {
            setNextGoldenHour(`starts in ${timeString}`)
          } else {
            setNextGoldenHour(`ends in ${timeString}`)
          }
        }
      } else {
        // Not today - just show the date
        setNextGoldenHour("")
      }
    }
  }, [currentTime, autoLocation, nextGoldenHourTargetTime, nextGoldenHourIsStart, date])

  useEffect(() => {

    const processURLParameters = async () => {
      if (lat && lng) {
        const coordinates = { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) }
        if (!isNaN(coordinates.lat) && !isNaN(coordinates.lng)) {
          try {
            const reverseGeocodedLocation = await locationService.reverseGeocode(coordinates.lat, coordinates.lng)

            let locationData
            if (reverseGeocodedLocation) {
              locationData = {
                city: reverseGeocodedLocation.city,
                country: reverseGeocodedLocation.country,
                state: reverseGeocodedLocation.state,
                region: reverseGeocodedLocation.region,
                postal: reverseGeocodedLocation.postal,
                address: reverseGeocodedLocation.address,
                timezone: reverseGeocodedLocation.timezone,
                accuracy: reverseGeocodedLocation.accuracy,
                lat: coordinates.lat,
                lon: coordinates.lng,
              }
            } else {
              locationData = {
                lat: coordinates.lat,
                lon: coordinates.lng,
                city: locationName || `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
                country: "",
                address: locationName || `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              }
            }

            setAutoLocation(locationData)
            setLocation(locationData.address || `${locationData.city}, ${locationData.country}`)
            calculateNextGoldenHour(locationData, false)
          } catch (error) {
            const locationData = {
              lat: coordinates.lat,
              lon: coordinates.lng,
              city: locationName || `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
              country: "",
              address: locationName || `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }
            setAutoLocation(locationData)
            setLocation(locationData.address)
            calculateNextGoldenHour(locationData, false)
          }
        }
      } else if (locationName && !lat && !lng) {
        try {
          const geocodedLocation = await locationService.geocodeLocation(locationName)
          if (geocodedLocation) {
            setAutoLocation(geocodedLocation)
            setLocation(geocodedLocation.address || `${geocodedLocation.city}, ${geocodedLocation.country}`)
            calculateNextGoldenHour(geocodedLocation, false)
          }
        } catch (error) {
          // Error geocoding location
        }
      }

      if (dateParam) {
        const parsedDate = parseDateFromURL(dateParam)
        if (parsedDate) {
          setDate(dateParam)
        }
      }
    }

    processURLParameters()
  }, [lat, lng, locationName, dateParam])

  useEffect(() => {
    const hasUrlParams = !!(lat && lng) || !!locationName

    if (!hasUrlParams && !autoLocation && mounted) {
      autoDetectLocation()
    }
  }, [lat, lng, locationName, mounted])


  const updateURL = useCallback(
    async (locationData: any, selectedDate: string) => {
      if (locationData && isClient) {
        const dateObj = selectedDate ? new Date(selectedDate) : new Date()

        let locationName = locationData.city

        if (!locationName || locationName === "Unknown City" || locationName.includes("°")) {
          try {
            const nearestCity = await locationDatabase.findNearestCity(
              Number(locationData.lat),
              Number(locationData.lon || locationData.lng),
            )
            if (nearestCity) {
              locationName = nearestCity.name
            }
          } catch (error) {
            // Failed to find nearest city
          }
        }

        if (!locationName || locationName === "Unknown City" || locationName.includes("°")) {
          locationName = "Location"
        }

        const newURL = generateSEOFriendlyURL({
          lat: locationData.lat,
          lng: locationData.lon || locationData.lng,
          locationName,
          date: formatDateForURL(dateObj),
        })

        if (window.location.pathname !== newURL) {
          router.replace(newURL)
        }
      }
    },
    [router, propSearchParams, isClient],
  )

  const autoDetectLocation = useCallback(async () => {
    setAutoDetecting(true)
    setLocationError("")

    try {
      const locationData = await locationService.detectLocation()

      if (
        !locationData ||
        locationData.lat === null ||
        locationData.lat === undefined ||
        locationData.lon === null ||
        locationData.lon === undefined ||
        isNaN(Number(locationData.lat)) ||
        isNaN(Number(locationData.lon)) ||
        Math.abs(Number(locationData.lat)) > 90 ||
        Math.abs(Number(locationData.lon)) > 180
      ) {

        locationService.clearCache()
        const retryLocationData = await locationService.detectLocation(true)

        if (
          !retryLocationData ||
          retryLocationData.lat === null ||
          retryLocationData.lat === undefined ||
          retryLocationData.lon === null ||
          retryLocationData.lon === undefined ||
          isNaN(Number(retryLocationData.lat)) ||
          isNaN(Number(retryLocationData.lon)) ||
          Math.abs(Number(retryLocationData.lat)) > 90 ||
          Math.abs(Number(retryLocationData.lon)) > 180
        ) {
          const fallbackLocation = {
            city: "New York",
            country: "United States",
            state: "NY",
            region: "NY",
            postal: "10001",
            address: "New York, NY, United States",
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
          setLocation(fallbackLocation.address)
          setLocationError("Unable to detect location automatically. Using New York as default location.")
          calculateNextGoldenHour(fallbackLocation, true)
          return
        }

        setAutoLocation(retryLocationData)
        setLocation(retryLocationData.address || `${retryLocationData.city}, ${retryLocationData.country}`)
        calculateNextGoldenHour(retryLocationData, true)
        return
      }

      setAutoLocation(locationData)
      setLocation(locationData.address || `${locationData.city}, ${locationData.country}`)
      calculateNextGoldenHour(locationData, true)
    } catch (error) {
      const fallbackLocation = {
        city: "New York",
        country: "United States",
        state: "NY",
        region: "NY",
        postal: "10001",
        address: "New York, NY, United States",
        lat: 40.7128,
        lon: -74.006,
        timezone: "America/New_York",
        accuracy: "Fallback",
        quality: 10,
        source: "Fallback",
        timestamp: Date.now(),
        confidence: 0.1,
      }

      setAutoLocation(fallbackLocation)
      setLocation(fallbackLocation.address)
      setLocationError("Unable to detect location automatically. Using New York as default location.")
      calculateNextGoldenHour(fallbackLocation, true)
    } finally {
      setAutoDetecting(false)
    }
  }, [])

  const fetchWeatherData = useCallback(async (locationData: LocationData) => {
    setWeatherLoading(true)
    try {
      if (
        !locationData ||
        locationData.lat === null ||
        locationData.lat === undefined ||
        locationData.lon === null ||
        locationData.lon === undefined ||
        isNaN(Number(locationData.lat)) ||
        isNaN(Number(locationData.lon)) ||
        Math.abs(Number(locationData.lat)) > 90 ||
        Math.abs(Number(locationData.lon)) > 180
      ) {
        throw new Error("Invalid coordinates for weather data")
      }

      const weather = await weatherService.getWeatherConditions(locationData.lat, locationData.lon)
      const conditions = await weatherService.getPhotographyConditions(locationData.lat, locationData.lon)

      if (weather) {
        // Map weather service response to component's expected format
        const weatherData: WeatherData = {
          temperature: (weather as any).temperature || (weather as any).temp || 0,
          humidity: (weather as any).humidity || 0,
          windSpeed: (weather as any).windSpeed || 0,
          windDirection: (weather as any).windDirection || 0,
          cloudCover: (weather as any).cloudCover || (weather as any).clouds || 0,
          visibility: (weather as any).visibility || 0,
          pressure: (weather as any).pressure || 0,
          uvIndex: (weather as any).uvIndex || 0,
          description: (weather as any).description || 'Unknown',
          icon: (weather as any).icon || '01d',
          sunrise: (weather as any).sunrise,
          sunset: (weather as any).sunset,
          temp: (weather as any).temp || (weather as any).temperature || 0,
          condition: (weather as any).condition || 'Unknown',
          clouds: (weather as any).clouds || (weather as any).cloudCover || 0,
        }
        
        setWeatherData(weatherData)
      } else {
        setWeatherData(null)
      }
      
      // Map weather service conditions to expected PhotographyConditions type
      if (conditions) {
        const mappedConditions: PhotographyConditions = {
          goldenHourQuality: conditions.overall >= 80 ? "excellent" : 
                             conditions.overall >= 60 ? "good" : 
                             conditions.overall >= 40 ? "fair" : "poor",
          blueHourQuality: conditions.overall >= 80 ? "excellent" : 
                           conditions.overall >= 60 ? "good" : 
                           conditions.overall >= 40 ? "fair" : "poor",
          overallScore: conditions.overall,
          recommendations: [conditions.recommendation]
        }
        setPhotographyConditions(mappedConditions)
      } else {
        setPhotographyConditions(null)
      }
    } catch (error) {
      console.error("Error fetching weather data:", error)
      setWeatherData(null)
      setPhotographyConditions(null)
    } finally {
      setWeatherLoading(false)
    }
  }, [])

  const calculateNextGoldenHour = useCallback(
    async (locationData: LocationData, shouldUpdateURL = false) => {
      console.log('🔥 calculateNextGoldenHour called with:', { locationData, shouldUpdateURL, currentTime, date })
      const now = currentTime || new Date()
      const nowDateStr = now ? now.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
      const selectedDate = date ? new Date(date) : new Date(nowDateStr)
      console.log('🔥 calculateNextGoldenHour - now:', now, 'selectedDate:', selectedDate)

      try {
        const nextGoldenHour = sunCalculator.getNextGoldenHour(selectedDate, locationData.lat, locationData.lon)
        console.log('🔥 sunCalculator.getNextGoldenHour returned:', nextGoldenHour)

        if (nextGoldenHour) {
          setNextGoldenHourType("Evening Golden Hour")
          setNextGoldenHourTime(nextGoldenHour.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
          setNextGoldenHourEndTime(nextGoldenHour.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
          setNextGoldenHourTargetTime(nextGoldenHour.start)
          setNextGoldenHourIsStart(!nextGoldenHour.isCurrent)

          if (nextGoldenHour.isCurrent) {
            setNextGoldenHour(
              `ends in ${Math.ceil((nextGoldenHour.end.getTime() - now.getTime()) / (1000 * 60))} minutes`,
            )
          } else {
            setNextGoldenHour(`starts in ${nextGoldenHour.timeUntil} minutes`)
          }
        } else {
          const fallbackTime = new Date(selectedDate)
          fallbackTime.setHours(6, 30, 0, 0)
          setNextGoldenHourType("Evening Golden Hour")
          setNextGoldenHourTime(fallbackTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
          setNextGoldenHourEndTime(fallbackTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
          setNextGoldenHourTargetTime(fallbackTime)
          setNextGoldenHourIsStart(true)
          setNextGoldenHour(`starts in ${Math.max(0, Math.ceil((fallbackTime.getTime() - now.getTime()) / (1000 * 60)))} minutes`)
        }
      } catch (error) {
        console.error("Error calculating sun times:", error)
        const fallbackTime = new Date(selectedDate)
        fallbackTime.setHours(6, 30, 0, 0)
        setNextGoldenHourType("Evening Golden Hour")
        setNextGoldenHourTime(fallbackTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
        setNextGoldenHourEndTime(fallbackTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
        setNextGoldenHourTargetTime(fallbackTime)
        setNextGoldenHourIsStart(true)
        setNextGoldenHour(`starts in ${Math.max(0, Math.ceil((fallbackTime.getTime() - now.getTime()) / (1000 * 60)))} minutes`)
      }

      await fetchWeatherData(locationData)

      if (shouldUpdateURL) {
        await updateURL(locationData, date)
      }
    },
    [date, currentTime, fetchWeatherData, updateURL],
  )

  const calculateGoldenHour = useCallback(async () => {
    if (!location || !date) return

    setLoading(true)

    try {
      let locationData = autoLocation

      if (location !== (autoLocation?.address || `${autoLocation?.city}, ${autoLocation?.country}`)) {
        const geocodedLocation = await locationService.geocodeLocation(location)
        if (geocodedLocation) {
          locationData = geocodedLocation
          setAutoLocation(geocodedLocation)
          await updateURL(geocodedLocation, date)
        }
      }

      if (!locationData) {
        throw new Error("Unable to determine location coordinates")
      }

      const targetDate = new Date(date)
      const dayInfo = sunCalculator.getDayInfo(targetDate, locationData.lat, locationData.lon)

      setTimes({
        sunrise: dayInfo.sunTimes.sunrise.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sunset: dayInfo.sunTimes.sunset.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        goldenHourMorning: {
          start: dayInfo.goldenHours.morning.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          end: dayInfo.goldenHours.morning.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        goldenHourEvening: {
          start: dayInfo.goldenHours.evening.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          end: dayInfo.goldenHours.evening.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        blueHourMorning: {
          start: dayInfo.blueHours.morning.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          end: dayInfo.blueHours.morning.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        blueHourEvening: {
          start: dayInfo.blueHours.evening.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          end: dayInfo.blueHours.evening.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      })
    } catch (error) {
      console.error("Error calculating golden hour:", error)
    } finally {
      setLoading(false)
    }
  }, [location, date, autoLocation, calculateNextGoldenHour, updateURL])

  const handleDateChange = useCallback(
    async (newDate: string) => {
      setDate(newDate)
      if (autoLocation) {
        await updateURL(autoLocation, newDate)
        calculateGoldenHour()
        calculateNextGoldenHour(autoLocation, false)
      }
    },
    [autoLocation, updateURL, calculateGoldenHour, calculateNextGoldenHour],
  )

  // useEffect to trigger golden hour calculation when autoLocation is set
  useEffect(() => {
    if (autoLocation && date) {
      console.log("🔥 Triggering calculateGoldenHour from autoLocation useEffect")
      calculateGoldenHour()
      calculateNextGoldenHour(autoLocation, false)
    }
  }, [autoLocation, date, calculateGoldenHour, calculateNextGoldenHour])

  const scrollToSection = (sectionId: string) => {
    const refs = {
      search: searchRef,
      map: mapRef,
      calendar: calendarRef,
      inspiration: inspirationRef,
      cities: citiesRef,
      times: timesRef,
    }

    const targetRef = refs[sectionId as keyof typeof refs]
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      })
    }
  }

  return (
    <ErrorBoundary>
      <SEOHead
        location={autoLocation || undefined}
        pathname={isClient ? window.location.pathname : "/"}
        date={date ? new Date(date) : undefined}
      />
      <SiteHeader />

      <div className="min-h-screen relative">
        <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                {autoLocation
                  ? `Golden Hour in ${autoLocation.city}, ${autoLocation.country}`
                  : "Golden Hour Calculator - Perfect Photography Lighting Times"}
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              {autoLocation
                ? `Calculate precise golden hour and blue hour times for ${autoLocation.city} with professional photography planning tools and real-time sun tracking.`
                : "Calculate precise golden hour and blue hour times for any location worldwide with professional photography planning tools and real-time sun tracking."}
            </p>
          </div>

          <div ref={searchRef} className="max-w-2xl mx-auto mb-8 search-section">
            <div className="text-center mb-6">
              <p className="text-base text-muted-foreground leading-relaxed">
                Enter location and date for optimal photography times
              </p>
            </div>

            <div className="w-full">
              <CompactSearchBar
                onLocationSelect={async (locationData) => {
                  setAutoLocation(locationData)
                  setLocation(locationData.address || `${locationData.city}, ${locationData.country}`)
                  await updateURL(locationData, date)
                  calculateNextGoldenHour(locationData, false)
                }}
                onDateSelect={handleDateChange}
                onSearch={calculateGoldenHour}
                currentLocation={autoLocation}
                currentDate={date}
                onAutoDetect={autoDetectLocation}
                autoDetecting={autoDetecting}
                loading={loading}
              />
            </div>
          </div>

          {/* Next Golden Hour Card */}
          {autoLocation && (
            <GoldenHourDisplay
              nextGoldenHour={nextGoldenHour}
              nextGoldenHourTime={nextGoldenHourTime}
              nextGoldenHourEndTime={nextGoldenHourEndTime}
              nextGoldenHourType={nextGoldenHourType}
              nextGoldenHourIsStart={nextGoldenHourIsStart}
              autoLocation={autoLocation}
              weatherData={weatherData}
              photographyConditions={photographyConditions}
              weatherLoading={weatherLoading}
              selectedDate={date ? new Date(date) : null}
            />
          )}

          {autoLocation && nextGoldenHourTargetTime && (
            <div className="max-w-2xl mx-auto mb-8 text-center">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => {
                    const selectedDate = date ? new Date(date) : new Date()
                    const targetTime = nextGoldenHourTargetTime

                    const startTime = new Date(selectedDate)
                    startTime.setHours(targetTime.getHours(), targetTime.getMinutes(), targetTime.getSeconds(), 0)

                    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000)

                    const formatGoogleDate = (date: Date) => {
                      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
                    }

                    const title = encodeURIComponent(`${nextGoldenHourType} - ${autoLocation.city}`)
                    const details = encodeURIComponent(
                      `Golden Hour photography session in ${autoLocation.city}, ${autoLocation.country}. Perfect lighting conditions for outdoor photography.`,
                    )
                    const location = encodeURIComponent(`${autoLocation.city}, ${autoLocation.country}`)

                    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGoogleDate(startTime)}/${formatGoogleDate(endTime)}&details=${details}&location=${location}`

                    window.open(googleCalendarUrl, "_blank")
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                  </svg>
                  Add to Google Calendar
                </Button>
                <Button
                  onClick={() => {
                    const selectedDate = date ? new Date(date) : new Date()
                    const targetTime = nextGoldenHourTargetTime

                    const startTime = new Date(selectedDate)
                    startTime.setHours(targetTime.getHours(), targetTime.getMinutes(), targetTime.getSeconds(), 0)

                    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000)

                    const formatICSDate = (date: Date) => {
                      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
                    }

                    const eventTitle = `${nextGoldenHourType} - ${autoLocation.city}`
                    const eventDescription = `Golden Hour photography session in ${autoLocation.city}, ${autoLocation.country}. Perfect lighting conditions for outdoor photography.`
                    const eventLocation = `${autoLocation.city}, ${autoLocation.country}`

                    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Golden Hour Calculator//EN
BEGIN:VEVENT
UID:${Date.now()}@goldenhourcalculator.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
SUMMARY:${eventTitle}
DESCRIPTION:${eventDescription}
LOCATION:${eventLocation}
DTSTART:${formatICSDate(startTime)}
DTEND:${formatICSDate(endTime)}
END:VEVENT
END:VCALENDAR`

                    const blob = new Blob([icsContent], { type: "text/calendar" })
                    const url = URL.createObjectURL(blob)
                    const link = document.createElement("a")
                    link.href = url
                    link.download = "golden-hour-event.ics"
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    URL.revokeObjectURL(url)
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                  </svg>
                  Add to iOS Calendar
                </Button>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-6 py-3 text-foreground border border-border">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg">
                {mounted && currentTime && autoLocation?.timezone
                  ? currentTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      timeZone: autoLocation.timezone,
                    })
                  : mounted && currentTime
                    ? currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                    : "--:--:--"}
              </span>
              {autoLocation && autoLocation.timezone && (
                <span className="text-sm text-muted-foreground">({autoLocation.timezone.replace("_", " ")})</span>
              )}
            </div>
          </div>

          {/* Duplicate golden hour card with Starts/Ends removed - using GoldenHourDisplay component instead */}

          <div ref={citiesRef}>
            <TopPhotographyCities
              onCitySelect={async (locationData) => {
                const normalizedLocation = {
                  ...locationData,
                  lon: (locationData as any).lng || (locationData as any).lon,
                }
                setAutoLocation(normalizedLocation)
                setLocation(locationData.address)
                await updateURL(normalizedLocation, date)
                calculateNextGoldenHour(normalizedLocation, false)
              }}
            />
          </div>

          <div ref={mapRef}>
            {autoLocation && (
              <div className="max-w-6xl mx-auto mb-8">
                <EnhancedInteractiveMap location={autoLocation} date={date} />
              </div>
            )}
          </div>

          <div ref={inspirationRef}>
            {autoLocation && (
              <div className="max-w-6xl mx-auto mb-8">
                <PhotographyInspiration location={autoLocation} />
              </div>
            )}
          </div>

          {locationError && (
            <div className="max-w-2xl mx-auto mb-4">
              <div className="flex items-center gap-2 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{locationError}</span>
              </div>
            </div>
          )}

          <div ref={calendarRef}>
            {autoLocation && (
              <div className="max-w-6xl mx-auto mb-8">
                <PhotographyCalendar location={autoLocation} selectedDate={date} onDateSelect={setDate} />
              </div>
            )}
          </div>

          <div ref={timesRef}>
            <TimeCards times={times} />
          </div>

          <div className="max-w-6xl mx-auto mb-8">
            {autoLocation && (
              <div className="max-w-6xl mx-auto mb-8">
                <AdvancedPhotographyFeatures location={autoLocation} date={date} />
              </div>
            )}
          </div>

        {/* Static SEO-Optimized FAQ Section */}
        <StaticFAQ />

          <Card className="max-w-4xl mx-auto mt-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-card-foreground">Professional Photography Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Golden Hour Photography</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Soft, warm, diffused natural light</li>
                    <li>• Perfect for portraits and landscapes</li>
                    <li>• Long shadows create depth and dimension</li>
                    <li>• Avoid harsh contrasts and overexposure</li>
                    <li>• Best for outdoor photography sessions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Blue Hour Photography</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Even, soft lighting conditions</li>
                    <li>• Great for cityscapes and architecture</li>
                    <li>• Balanced ambient and artificial light</li>
                    <li>• Use tripod for longer exposures</li>
                    <li>• Perfect for urban and night photography</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {mounted && <FloatingNavigation onScrollToSection={scrollToSection} />}

      <SiteFooter />
    </ErrorBoundary>
  )
}
