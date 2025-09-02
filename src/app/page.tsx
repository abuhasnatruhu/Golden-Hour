"use client"

import { useState, useEffect, useCallback, useRef, use, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { CompactSearchBar } from "@/components/compact-search-bar"
import { GoldenHourDisplay } from "@/components/golden-hour-display"
import { TimeCards } from "@/components/time-cards"
import { CurrentTimeDisplay } from "@/components/current-time-display"
import { ErrorBoundary } from "@/components/error-boundary"
import { weatherService } from "@/lib/weather-service"
import { sunCalculator } from "@/lib/sun-calculator"
import type { PhotographyConditions } from "@/types/weather"

// Define WeatherData type to match weatherService return type
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
import { locationService, type LocationData } from "@/lib/location-service"
import { SiteHeader } from "@/components/site-header"
import { generateSEOFriendlyURL, formatDateForURL, parseDateFromURL } from "@/lib/url-utils"
import { locationDatabase } from "@/lib/location-database"
import { TopPhotographyCities } from "@/components/top-photography-cities"
import { FloatingNavigation } from "@/components/floating-navigation"
import { SiteFooter } from "@/components/site-footer"
import SEOHead from "@/components/seo-head"

import EnhancedInteractiveMap from "@/components/enhanced-interactive-map"
import PhotographyInspiration from "@/components/photography-inspiration"
import { LocationBasedFAQ } from "@/components/location-based-faq"
import PhotographyCalendar from "@/components/photography-calendar"
import AdvancedPhotographyFeatures from "@/components/advanced-photography-features"
import { DebugTest } from "@/components/debug-test"
// import { RenderCounter } from "@/components/render-counter"

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

interface GoldenHourCalculatorProps {
  searchParams?: URLSearchParams | Record<string, string | string[]>
}

export default function GoldenHourCalculator({ searchParams: propSearchParams }: GoldenHourCalculatorProps = {}) {
  console.log("🧪 TESTING CONSOLE LOG - This should appear!")
  
  const router = useRouter()
  const searchParamsHook = useSearchParams()
  
  // Handle Next.js 15 searchParams properly
  console.log("🔥 BEFORE USE HOOK - searchParamsHook type:", typeof searchParamsHook)
  console.log("🔥 BEFORE USE HOOK - is Promise:", searchParamsHook instanceof Promise)
  
  let hookSearchParams
  try {
    hookSearchParams = searchParamsHook instanceof Promise ? use(searchParamsHook) : searchParamsHook
    console.log("🔥 AFTER USE HOOK - Success")
  } catch (error) {
    console.error("🔥 ERROR IN USE HOOK:", error)
    hookSearchParams = new URLSearchParams()
  }
  
  // SIMPLE DEBUG TEST
  console.log("🔥 SIMPLE DEBUG TEST - This should appear!")
  console.log("hookSearchParams:", hookSearchParams)
  console.log("hookSearchParams.get('lon'):", hookSearchParams.get('lon'))
  
  // Try alert to see if code executes
  if (typeof window !== 'undefined') {
    console.log("🔥 WINDOW EXISTS - Client side rendering")
  } else {
    console.log("🔥 NO WINDOW - Server side rendering")
  }

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

  const searchRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const inspirationRef = useRef<HTMLDivElement>(null)
  const citiesRef = useRef<HTMLDivElement>(null)
  const timesRef = useRef<HTMLDivElement>(null)

  // Memoize URL parameter values to avoid unnecessary re-renders
  const urlParams = useMemo(() => ({
    lat: searchParams.get("lat"),
    lng: searchParams.get("lon"),
    locationName: searchParams.get("location"),
    dateParam: searchParams.get("date")
  }), [searchParams])
  
  const { lat, lng, locationName, dateParam } = urlParams
  
  // IMMEDIATE DEBUG - This should show up in console
  console.log("🔥 SEARCHPARAMS DEBUG:", {
    keys: Array.from(searchParams.keys()),
    entries: Array.from(searchParams.entries()),
    directLon: searchParams.get("lon"),
    hasLon: searchParams.has("lon"),
    toString: searchParams.toString(),
    extractedLng: lng,
    extractedLat: lat,
    extractedLocation: locationName
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Separate useEffect for URL parameter processing
  useEffect(() => {
    // Skip if no parameters to process
    if (!lat && !lng && !locationName && !dateParam) {
      return
    }
    
    console.log("URL params useEffect:", {
      lat,
      lng,
      locationName,
      dateParam,
      searchParamsString: searchParams.toString(),
      currentURL: typeof window !== "undefined" ? window.location.href : "SSR",
      usingPropSearchParams: !!propSearchParams,
    })

    const processURLParameters = async () => {
      // Debug logging
      console.log("🔍 URL Parameters Debug:")
      console.log("Current URL:", typeof window !== 'undefined' ? window.location.href : 'SSR')
      console.log("searchParams object:", searchParams)
      console.log("searchParams toString:", searchParams?.toString())
      console.log("Extracted values - lat:", lat, "lng:", lng, "locationName:", locationName)
      
      if (lat && lng) {
        console.log("Processing URL parameters for coordinates:", locationName || `${lat}, ${lng}`)
        const coordinates = { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) }
        if (!isNaN(coordinates.lat) && !isNaN(coordinates.lng)) {
          try {
            // Try to reverse geocode the coordinates to get the actual city name
            const reverseGeocodedLocation = await locationService.reverseGeocode(coordinates.lat, coordinates.lng)

            let locationData
            if (reverseGeocodedLocation) {
              console.log("Reverse geocoded location:", reverseGeocodedLocation)
              locationData = {
                ...reverseGeocodedLocation,
                lat: coordinates.lat,
                lon: coordinates.lng,
              }
            } else {
              // Fallback if reverse geocoding fails
              console.log("Reverse geocoding failed, using coordinates as fallback")
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
            calculateNextGoldenHour(locationData, false) // Don't update URL when processing URL parameters
          } catch (error) {
            console.error("Error reverse geocoding coordinates:", error)
            // Fallback to using coordinates as display
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
        console.log("Processing URL parameters for location name:", locationName)
        try {
          const geocodedLocation = await locationService.geocodeLocation(locationName)
          if (geocodedLocation) {
            console.log("Geocoded location:", geocodedLocation)
            setAutoLocation(geocodedLocation)
            setLocation(geocodedLocation.address || `${geocodedLocation.city}, ${geocodedLocation.country}`)
            calculateNextGoldenHour(geocodedLocation, false) // Don't update URL when processing URL parameters
          } else {
            console.log("Failed to geocode location:", locationName)
          }
        } catch (error) {
          console.error("Error geocoding location:", error)
        }
      } else {
        console.log("No valid URL parameters found")
      }

      if (dateParam) {
        const parsedDate = parseDateFromURL(dateParam)
        if (parsedDate) {
          setDate(dateParam)
        }
      }
    }

    // Use a flag to prevent multiple executions
    let isCancelled = false
    
    const runProcessing = async () => {
      if (!isCancelled) {
        await processURLParameters()
      }
    }
    
    runProcessing()
    
    return () => {
      isCancelled = true
    }
  }, [lat, lng, locationName, dateParam]) // Use specific values as dependencies

  // useEffect to monitor autoLocation changes
  useEffect(() => {
    console.log("=== AUTO LOCATION CHANGED ===")
    console.log("autoLocation:", autoLocation)
    console.log("autoLocation type:", typeof autoLocation)
    console.log("autoLocation truthy:", !!autoLocation)
    
    if (autoLocation) {
      console.log("✅ AUTO LOCATION SET:", {
        city: autoLocation.city,
        country: autoLocation.country,
        state: autoLocation.state,
        region: autoLocation.region,
        postal: autoLocation.postal,
        address: autoLocation.address,
        lat: autoLocation.lat,
        lon: autoLocation.lon,
        timezone: autoLocation.timezone,
        source: autoLocation.source
      })
    } else {
      console.log("❌ AUTO LOCATION IS NULL/UNDEFINED")
    }
  }, [autoLocation])

  useEffect(() => {
    // Only auto-detect if:
    // 1. No URL parameters are present (neither coordinates nor location name)
    // 2. We haven't already set a location
    // 3. Component is mounted
    const hasUrlParams = !!(lat && lng) || !!locationName

    console.log("=== AUTO-DETECT USEEFFECT TRIGGERED ===")
    console.log("Auto-detect useEffect conditions:", {
      lat,
      lng,
      locationName,
      hasUrlParams,
      autoLocation: !!autoLocation,
      autoLocationValue: autoLocation,
      mounted,
      shouldAutoDetect: !hasUrlParams && !autoLocation && mounted,
    })

    if (!hasUrlParams && !autoLocation && mounted) {
      console.log("✅ AUTO-DETECTING LOCATION...")
      autoDetectLocation()
    } else {
      console.log("❌ CONDITIONS NOT MET - Skipping auto-detection")
      console.log("Reasons:", {
        hasUrlParams: hasUrlParams ? "URL params present" : null,
        hasAutoLocation: autoLocation ? "Auto location already set" : null,
        notMounted: !mounted ? "Component not mounted" : null,
      })
    }
  }, [lat, lng, locationName, mounted]) // Remove autoDetectLocation from dependencies to prevent infinite loop

  const updateURL = useCallback(
    async (locationData: any, selectedDate: string) => {
      if (locationData && typeof window !== "undefined") {
        const dateObj = selectedDate ? new Date(selectedDate) : new Date()

        // Get location name, prioritizing city over full address
        let locationName = locationData.city

        // If we don't have a proper city name or it's "Unknown City", try to find nearest city
        if (!locationName || locationName === "Unknown City" || locationName.includes("°")) {
          try {
            const nearestCity = await locationDatabase.findNearestCity(
              Number(locationData.lat),
              Number(locationData.lon || locationData.lng),
            )
            if (nearestCity) {
              locationName = nearestCity.name
              console.log("Using nearest city from database:", nearestCity.name)
            }
          } catch (error) {
            console.warn("Failed to find nearest city:", error)
          }
        }

        // Final fallback: if we still don't have a valid location name, use a generic one
        if (!locationName || locationName === "Unknown City" || locationName.includes("°")) {
          locationName = "Location"
          console.log("Using generic location name as final fallback")
        }

        const newURL = generateSEOFriendlyURL({
          lat: locationData.lat,
          lng: locationData.lon || locationData.lng,
          locationName,
          date: formatDateForURL(dateObj),
        })

        console.log("updateURL called:", {
          currentPath: window.location.pathname,
          newURL,
          locationData,
          locationName,
          locationDataCity: locationData.city,
          locationDataAddress: locationData.address,
          inDynamicRoute: !!propSearchParams,
        })

        // Update URL without page reload
        if (window.location.pathname !== newURL) {
          console.log("Updating URL from", window.location.pathname, "to", newURL)
          router.replace(newURL)
        }
      }
    },
    [router, propSearchParams],
  )

  const autoDetectLocation = useCallback(async () => {
    setAutoDetecting(true)
    setLocationError("")

    try {
      const locationData = await locationService.detectLocation()

      // Debug logging
      console.log("Location service returned:", locationData)
      console.log("lat type:", typeof locationData?.lat, "value:", locationData?.lat)
      console.log("lon type:", typeof locationData?.lon, "value:", locationData?.lon)

      // Validate location data before proceeding
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
        console.warn("Invalid location data received, clearing cache and retrying:", locationData)
        console.warn("Validation details:", {
          hasLocationData: !!locationData,
          latNull: locationData?.lat === null,
          latUndefined: locationData?.lat === undefined,
          lonNull: locationData?.lon === null,
          lonUndefined: locationData?.lon === undefined,
          latNaN: isNaN(Number(locationData?.lat)),
          lonNaN: isNaN(Number(locationData?.lon)),
          latOutOfRange: Math.abs(Number(locationData?.lat)) > 90,
          lonOutOfRange: Math.abs(Number(locationData?.lon)) > 180,
        })

        // Clear potentially corrupted cache and retry once
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
          console.error("Retry also failed, using fallback location")
          setLocationError("Unable to detect location automatically. Using default location.")
          return
        }

        console.log("Retry successful:", retryLocationData)
        setAutoLocation(retryLocationData)
        setLocation(retryLocationData.address || `${retryLocationData.city}, ${retryLocationData.country}`)
        calculateNextGoldenHour(retryLocationData, true)
        return
      }

      setAutoLocation(locationData)
      setLocation(locationData.address || `${locationData.city}, ${locationData.country}`)
      calculateNextGoldenHour(locationData, true)
    } catch (error) {
      console.error("Error detecting location:", error)
      setLocationError("Unable to detect location automatically. Please enter manually.")
    } finally {
      setAutoDetecting(false)
    }
  }, [])

  const fetchWeatherData = useCallback(async (locationData: LocationData) => {
    setWeatherLoading(true)
    try {
      // Validate coordinates before making API calls
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
        console.warn("Invalid coordinates for weather data:", locationData)
        throw new Error("Invalid coordinates for weather data")
      }

      const weather = await weatherService.getWeatherConditions(locationData.lat, locationData.lon)
      const conditions = await weatherService.getPhotographyConditions(locationData.lat, locationData.lon)

      setWeatherData(weather)
      setPhotographyConditions(conditions)
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
      const now = new Date()
      const selectedDate = date ? new Date(date) : now

      try {
        const nextGoldenHour = sunCalculator.getNextGoldenHour(selectedDate, locationData.lat, locationData.lon)

        if (nextGoldenHour) {
          setNextGoldenHourType(nextGoldenHour.type === "morning" ? "Morning Golden Hour" : "Evening Golden Hour")
          setNextGoldenHourTime(nextGoldenHour.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
          setNextGoldenHourEndTime(nextGoldenHour.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
          setNextGoldenHourTargetTime(nextGoldenHour.isCurrent ? nextGoldenHour.end : nextGoldenHour.start)
          setNextGoldenHourIsStart(nextGoldenHour.isCurrent ? false : true)

          if (nextGoldenHour.isCurrent) {
            setNextGoldenHour(`ends in ${nextGoldenHour.timeUntil} minutes`)
          } else {
            setNextGoldenHour(`starts in ${nextGoldenHour.timeUntil} minutes`)
          }
        } else {
          // Fallback if no golden hour found
          const fallbackTime = new Date(selectedDate)
          fallbackTime.setHours(6, 30, 0, 0)
          setNextGoldenHourType("Morning Golden Hour")
          setNextGoldenHourTime(fallbackTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
          setNextGoldenHourEndTime(fallbackTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
          setNextGoldenHourTargetTime(fallbackTime)
          setNextGoldenHourIsStart(true)
          setNextGoldenHour(`starts in ${Math.ceil((fallbackTime.getTime() - now.getTime()) / (1000 * 60))} minutes`)
        }
      } catch (error) {
        console.error("Error calculating sun times:", error)
        const fallbackTime = new Date(selectedDate)
        fallbackTime.setHours(6, 30, 0, 0)
        setNextGoldenHourType("Morning Golden Hour")
        setNextGoldenHourTime(fallbackTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
        setNextGoldenHourEndTime(fallbackTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
        setNextGoldenHourTargetTime(fallbackTime)
        setNextGoldenHourIsStart(true)
        setNextGoldenHour(`starts in ${Math.ceil((fallbackTime.getTime() - now.getTime()) / (1000 * 60))} minutes`)
      }

      await fetchWeatherData(locationData)

      // Only update URL when explicitly requested (not during auto-detection)
      if (shouldUpdateURL) {
        await updateURL(locationData, date)
      }
    },
    [date, updateURL],
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
        // Trigger golden hour calculation for the new date
        calculateGoldenHour()
        // Also update the next golden hour display and target time for Google Calendar
        calculateNextGoldenHour(autoLocation, false)
      }
    },
    [autoLocation, updateURL, calculateGoldenHour, calculateNextGoldenHour],
  )

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
      <DebugTest />
      <SEOHead
        location={autoLocation || undefined}
        pathname={typeof window !== "undefined" ? window.location.pathname : "/"}
        date={date ? new Date(date) : new Date()}
      />
      <SiteHeader />

      <div className="min-h-screen relative overflow-hidden">
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
                  // Always update URL when user manually selects a location
                  await updateURL(locationData, date)
                  calculateNextGoldenHour(locationData, false) // Don't update URL again in calculateNextGoldenHour
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



          <GoldenHourDisplay
            nextGoldenHour={nextGoldenHour}
            nextGoldenHourTime={nextGoldenHourTime}
            nextGoldenHourEndTime={nextGoldenHourEndTime}
            nextGoldenHourType={nextGoldenHourType}
            nextGoldenHourIsStart={nextGoldenHourIsStart}
            nextGoldenHourTargetTime={nextGoldenHourTargetTime}
            autoLocation={autoLocation}
            weatherData={weatherData}
            photographyConditions={photographyConditions}
            weatherLoading={weatherLoading}
            selectedDate={date ? new Date(date) : null}
          />

          {autoLocation && nextGoldenHourTargetTime && (
            <div className="max-w-2xl mx-auto mb-8 text-center">
              <Button
                onClick={() => {
                  // Use the selected date instead of nextGoldenHourTargetTime's date
                  const selectedDate = date ? new Date(date) : new Date()
                  const targetTime = nextGoldenHourTargetTime

                  // Create the start time using selected date but target time's hours/minutes
                  const startTime = new Date(selectedDate)
                  startTime.setHours(targetTime.getHours(), targetTime.getMinutes(), targetTime.getSeconds(), 0)

                  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // 1 hour duration

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
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
                Add to Google Calendar
              </Button>
            </div>
          )}

          <div className="text-center mb-8">
            <CurrentTimeDisplay timezone={autoLocation?.timezone} />
          </div>

          <div ref={citiesRef}>
            <TopPhotographyCities
              onCitySelect={async (locationData) => {
                const normalizedLocation = {
                  ...locationData,
                  lon: (locationData as any).lng || (locationData as any).lon,
                }
                setAutoLocation(normalizedLocation)
                setLocation(locationData.address)
                // Always update URL when user selects a city
                await updateURL(normalizedLocation, date)
                calculateNextGoldenHour(normalizedLocation, false) // Don't update URL again
              }}
            />
          </div>

          <div ref={mapRef}>
            {autoLocation && (
              <div className="max-w-6xl mx-auto mb-8">
                {/* <EnhancedInteractiveMap location={autoLocation} date={date} /> */}
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

          {autoLocation && times && (
            <div className="max-w-4xl mx-auto mt-8 mb-8">
              <LocationBasedFAQ 
                location={autoLocation} 
                goldenHourTimes={{
                  sunrise: times.sunrise,
                  sunset: times.sunset,
                  goldenHourMorning: times.goldenHourMorning,
                  goldenHourEvening: times.goldenHourEvening
                }}
              />
            </div>
          )}

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

      <FloatingNavigation onScrollToSection={scrollToSection} />

      <SiteFooter />
    </ErrorBoundary>
  )
}
