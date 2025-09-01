"use client"

import { useState, useEffect, useCallback, useRef, useMemo, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

// Core components
import { CompactSearchBar } from "@/components/compact-search-bar"
import { GoldenHourDisplay } from "@/components/golden-hour-display"
import { TimeCards } from "@/components/time-cards"
import { ErrorBoundary } from "@/components/error-boundary"
import { SiteHeader } from "@/src/components/site-header"
import { SiteFooter } from "@/src/components/site-footer"
import { FloatingNavigation } from "@/src/components/floating-navigation"
import { TopPhotographyCities } from "@/src/components/top-photography-cities"
import SEOHead from "@/src/components/seo-head"

// Optimized components
import { PageHeader } from "@/src/components/golden-hour/PageHeader"
import { CurrentTimeDisplay } from "@/src/components/golden-hour/CurrentTimeDisplay"
import { PhotographyTips } from "@/src/components/golden-hour/PhotographyTips"

// Lazy loaded components
import {
  LazyEnhancedInteractiveMap,
  LazyPhotographyInspiration,
  LazyPhotographyCalendar,
  LazyAdvancedPhotographyFeatures,
  LazyLocationBasedFAQ,
} from "@/src/components/LazyComponents"

// Custom hooks
import { useCurrentTime } from "@/src/hooks/useCurrentTime"
import { useLocationManagement } from "@/src/hooks/useLocationManagement"
import { useGoldenHourCalculations } from "@/src/hooks/useGoldenHourCalculations"
import { useAppState } from "@/src/hooks/useAppState"

// Services and utilities
import { generateSEOFriendlyURL, formatDateForURL, parseDateFromURL } from "@/lib/url-utils"
import { locationDatabase } from "@/lib/location-database"
import { errorTracker } from "@/src/lib/error-tracker"
import type { LocationData } from "@/lib/location-service"

interface PageProps {
  searchParams: Promise<Record<string, string | string[]>>
}

// Memoized calendar event creation
function useCalendarEvent(
  nextGoldenHourTargetTime: Date | null,
  nextGoldenHourIsStart: boolean,
  autoLocation: LocationData | null,
  nextGoldenHourType: string,
  date: string
) {
  return useMemo(() => {
    if (!nextGoldenHourTargetTime || !autoLocation || !nextGoldenHourType) return null

    const startTime = nextGoldenHourIsStart
      ? nextGoldenHourTargetTime
      : new Date(nextGoldenHourTargetTime.getTime() - 60 * 60 * 1000)
    
    const endTime = nextGoldenHourIsStart
      ? new Date(nextGoldenHourTargetTime.getTime() + 60 * 60 * 1000)
      : nextGoldenHourTargetTime

    const eventTitle = `${nextGoldenHourType} - ${autoLocation.city}, ${autoLocation.country}`
    const eventLocation = `${autoLocation.city}, ${autoLocation.country}`
    const eventDetails = `Perfect lighting conditions for photography. Coordinates: ${autoLocation.lat.toFixed(4)}, ${autoLocation.lon.toFixed(4)}`

    return {
      googleCalendarUrl: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        eventTitle
      )}&dates=${startTime.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}/${endTime
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "")}&details=${encodeURIComponent(eventDetails)}&location=${encodeURIComponent(
        eventLocation
      )}&sf=true&output=xml`,
      icsData: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Golden Hour Calculator//EN
BEGIN:VEVENT
UID:${Date.now()}@goldenhourcalculator.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}Z
DTSTART:${startTime.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}Z
DTEND:${endTime.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}Z
SUMMARY:${eventTitle}
DESCRIPTION:${eventDetails}
LOCATION:${eventLocation}
END:VEVENT
END:VCALENDAR`,
    }
  }, [nextGoldenHourTargetTime, nextGoldenHourIsStart, autoLocation, nextGoldenHourType, date])
}

export default function GoldenHourCalculator({ searchParams }: PageProps) {
  const urlParams = use(searchParams)
  const router = useRouter()
  const clientSearchParams = useSearchParams()
  
  // Custom hooks
  const { state, actions } = useAppState()
  const { currentTime, formattedTime, mounted } = useCurrentTime()
  const locationManagement = useLocationManagement()
  const goldenHourCalculations = useGoldenHourCalculations()
  
  // Refs for sections
  const searchRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const inspirationRef = useRef<HTMLDivElement>(null)
  const citiesRef = useRef<HTMLDivElement>(null)
  const timesRef = useRef<HTMLDivElement>(null)

  // Memoized calendar event
  const calendarEvent = useCalendarEvent(
    goldenHourCalculations.nextGoldenHourTargetTime,
    goldenHourCalculations.nextGoldenHourIsStart,
    locationManagement.autoLocation,
    goldenHourCalculations.nextGoldenHourType,
    state.date
  )

  // URL management
  const updateURL = useCallback((locationData: LocationData | null, selectedDate: Date | null) => {
    if (!locationData) return

    const dateStr = selectedDate ? formatDateForURL(selectedDate) : null
    const newUrl = generateSEOFriendlyURL({
      city: locationData.city || "location",
      country: locationData.country || "",
      lat: locationData.lat,
      lng: locationData.lon,
      date: dateStr || undefined
    })
    router.push(newUrl, { scroll: false })
  }, [router])

  // Handle search params on mount
  useEffect(() => {
    const initializeFromParams = async () => {
      const locationName = urlParams.locationName as string
      const lat = urlParams.lat ? parseFloat(urlParams.lat as string) : null
      const lng = urlParams.lng ? parseFloat(urlParams.lng as string) : null
      const dateParam = urlParams.dateParam as string

      if (locationName || (lat && lng)) {
        actions.setLoading(true)
        
        if (lat && lng) {
          const locationData: LocationData = {
            lat,
            lon: lng,
            address: locationName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            city: locationName?.split(",")[0] || "Custom Location",
            country: "",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            accuracy: "High",
            quality: 95,
            source: "URL Parameters",
            timestamp: new Date().getTime(),
            confidence: 0.95,
          }
          
          locationManagement.setAutoLocation(locationData)
          goldenHourCalculations.calculateNextGoldenHour(locationData)
          locationManagement.fetchWeatherData(locationData)
          
          if (dateParam) {
            const parsedDate = parseDateFromURL(dateParam)
            if (parsedDate) {
              actions.setDate(parsedDate.toISOString().split("T")[0])
              goldenHourCalculations.calculateGoldenHour(locationData, parsedDate)
            }
          } else {
            goldenHourCalculations.calculateGoldenHour(locationData, null)
          }
        }
        
        actions.setLoading(false)
      } else {
        locationManagement.autoDetectLocation((location) => {
          goldenHourCalculations.calculateNextGoldenHour(location)
          updateURL(location, null)
        })
      }
    }

    initializeFromParams()
  }, [urlParams])

  // Handle date change
  const handleDateChange = useCallback((newDate: string) => {
    actions.setDate(newDate)
    
    if (locationManagement.autoLocation) {
      const selectedDate = newDate ? new Date(newDate) : null
      goldenHourCalculations.calculateGoldenHour(locationManagement.autoLocation, selectedDate)
      updateURL(locationManagement.autoLocation, selectedDate)
    }
  }, [locationManagement.autoLocation, goldenHourCalculations, updateURL, actions])

  // Handle location selection
  const handleLocationSelect = useCallback((locationData: LocationData) => {
    actions.setLocation(locationData.address)
    locationManagement.setAutoLocation(locationData)
    goldenHourCalculations.calculateNextGoldenHour(locationData)
    locationManagement.fetchWeatherData(locationData)
    
    const selectedDate = state.date ? new Date(state.date) : null
    goldenHourCalculations.calculateGoldenHour(locationData, selectedDate)
    updateURL(locationData, selectedDate)
  }, [state.date, locationManagement, goldenHourCalculations, updateURL, actions])

  // Handle auto detect
  const handleAutoDetect = useCallback(() => {
    locationManagement.autoDetectLocation((location) => {
      actions.setLocation(location.address)
      goldenHourCalculations.calculateNextGoldenHour(location)
      
      const selectedDate = state.date ? new Date(state.date) : null
      goldenHourCalculations.calculateGoldenHour(location, selectedDate)
      updateURL(location, selectedDate)
    })
  }, [state.date, locationManagement, goldenHourCalculations, updateURL, actions])

  // Scroll to section
  const scrollToSection = useCallback((sectionId: string) => {
    const refs: Record<string, React.RefObject<HTMLDivElement>> = {
      search: searchRef,
      map: mapRef,
      calendar: calendarRef,
      inspiration: inspirationRef,
      cities: citiesRef,
      times: timesRef,
    }
    
    const ref = refs[sectionId]
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  // Handle iOS calendar download
  const downloadICSFile = useCallback(() => {
    if (!calendarEvent) return
    
    const blob = new Blob([calendarEvent.icsData], { type: "text/calendar" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "golden-hour-event.ics"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }, [calendarEvent])

  return (
    <ErrorBoundary>
      <SEOHead
        location={locationManagement.autoLocation?.city}
        country={locationManagement.autoLocation?.country}
        coordinates={
          locationManagement.autoLocation
            ? { lat: locationManagement.autoLocation.lat, lng: locationManagement.autoLocation.lon }
            : undefined
        }
        date={state.date ? new Date(state.date) : undefined}
      />
      <SiteHeader />
      
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <PageHeader autoLocation={locationManagement.autoLocation} />
          
          <div ref={searchRef} id="search" className="mb-6">
            <CompactSearchBar
              onLocationSelect={handleLocationSelect}
              currentLocation={state.location}
              currentDate={state.date}
              onDateChange={handleDateChange}
              autoDetecting={locationManagement.autoDetecting}
              onAutoDetect={handleAutoDetect}
              isSearching={state.isSearching}
              onSearchingChange={actions.setSearching}
            />
          </div>

          {locationManagement.autoLocation && goldenHourCalculations.times && (
            <div className="space-y-6">
              <GoldenHourDisplay
                times={goldenHourCalculations.times}
                nextGoldenHour={goldenHourCalculations.nextGoldenHour}
                nextGoldenHourTime={goldenHourCalculations.nextGoldenHourTime}
                nextGoldenHourEndTime={goldenHourCalculations.nextGoldenHourEndTime}
                nextGoldenHourType={goldenHourCalculations.nextGoldenHourType}
                location={locationManagement.autoLocation}
                selectedDate={state.date ? new Date(state.date) : null}
                weatherData={locationManagement.weatherData}
                photographyConditions={locationManagement.photographyConditions}
                weatherLoading={locationManagement.weatherLoading}
              />

              {calendarEvent && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => window.open(calendarEvent.googleCalendarUrl, "_blank")}
                    className="flex-1"
                  >
                    Add to Google Calendar
                  </Button>
                  <Button onClick={downloadICSFile} variant="outline" className="flex-1">
                    Download for Apple Calendar
                  </Button>
                </div>
              )}

              <CurrentTimeDisplay
                formattedTime={formattedTime}
                autoLocation={locationManagement.autoLocation}
                mounted={mounted}
              />

              <div ref={timesRef} id="times">
                <TimeCards times={goldenHourCalculations.times} location={locationManagement.autoLocation} />
              </div>
            </div>
          )}

          {locationManagement.locationError && (
            <Card className="border-yellow-200 bg-yellow-50">
              <div className="p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800">{locationManagement.locationError}</p>
              </div>
            </Card>
          )}

          <div ref={citiesRef} id="cities" className="mt-8">
            <TopPhotographyCities onCitySelect={handleLocationSelect} />
          </div>

          <div ref={mapRef} id="map" className="mt-8">
            <LazyEnhancedInteractiveMap />
          </div>

          <div ref={calendarRef} id="calendar" className="mt-8">
            <LazyPhotographyCalendar />
          </div>

          <div ref={inspirationRef} id="inspiration" className="mt-8">
            <LazyPhotographyInspiration />
          </div>

          <LazyAdvancedPhotographyFeatures />
          
          <PhotographyTips />
          
          {locationManagement.autoLocation && (
            <LazyLocationBasedFAQ
              location={locationManagement.autoLocation.city}
              country={locationManagement.autoLocation.country}
            />
          )}
        </div>
      </div>
      
      <FloatingNavigation onScrollToSection={scrollToSection} />
      <SiteFooter />
    </ErrorBoundary>
  )
}