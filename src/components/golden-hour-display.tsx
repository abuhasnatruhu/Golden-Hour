"use client"

import React, { useMemo } from "react"
import { Sun, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { LocationData } from "@/lib/location-service"
import type { WeatherData, PhotographyConditions } from "@/types/weather"
import { LocationDisplayUtils } from "@/lib/location-display-utils"
import { CountdownTimer } from "@/components/countdown-timer"
import ShareButton from "@/components/share-button"

interface GoldenHourDisplayProps {
  nextGoldenHour: string
  nextGoldenHourTime: string
  nextGoldenHourEndTime: string
  nextGoldenHourType: string
  nextGoldenHourIsStart: boolean
  nextGoldenHourTargetTime?: Date | null
  autoLocation: LocationData | null
  weatherData: WeatherData | null
  photographyConditions: PhotographyConditions | null
  weatherLoading: boolean
  selectedDate?: Date | null
  smartGoldenHour?: any // Smart golden hour data with primary/secondary info
}

export const GoldenHourDisplay = React.memo(function GoldenHourDisplay({
  nextGoldenHour,
  nextGoldenHourTime,
  nextGoldenHourEndTime,
  nextGoldenHourType,
  nextGoldenHourIsStart,
  nextGoldenHourTargetTime,
  autoLocation,
  weatherData,
  photographyConditions,
  weatherLoading,
  selectedDate,
  smartGoldenHour,
}: GoldenHourDisplayProps) {
  
  // Force browser cache clear on component mount  
  React.useEffect(() => {
    console.log('🔥 FORCE CACHE CLEAR - GoldenHourDisplay mounted')
    if (typeof window !== 'undefined') {
      // Clear all possible caches
      localStorage.clear()
      sessionStorage.clear()
      console.log('🔥 All browser caches cleared')
    }
  }, [])
  
  // Debug logging
  console.log('🎆 GoldenHourDisplay rendered with:', {
    nextGoldenHourType,
    nextGoldenHourTime,
    nextGoldenHourEndTime,
    hasSmartData: !!smartGoldenHour,
    smartDataType: smartGoldenHour?.primary?.type,
    smartDisplayTitle: smartGoldenHour?.displayTitle,
    hasSecondary: !!smartGoldenHour?.secondary,
    secondaryText: smartGoldenHour?.secondary?.smartText
  })
  // Helper function to determine date context
  const getDateContext = () => {
    if (!selectedDate) return "today"

    const today = new Date()
    const selected = new Date(selectedDate)
    const todayStr = today.toDateString()
    const selectedStr = selected.toDateString()

    if (selectedStr === todayStr) return "today"
    if (selected < today) return "past"
    return "future"
  }

  // Memoize the contextual message to prevent continuous re-renders
  const contextualMessage = useMemo(() => {
    console.log('🎯 Memoizing contextual message - computing once')
    console.log('🔥 smartGoldenHour exists:', !!smartGoldenHour)
    console.log('🔥 smartGoldenHour.topHeadline value:', smartGoldenHour?.topHeadline)
    
    // ALWAYS use smart golden hour TOP HEADLINE if available (NEW SPEC)
    if (smartGoldenHour && smartGoldenHour.topHeadline) {
      console.log('🎯 Using smart TOP HEADLINE:', smartGoldenHour.topHeadline)
      return smartGoldenHour.topHeadline
    }
    
    console.log('🐛 No smart top headline available, using fallback')
    
    // Fallback to original logic
    const context = getDateContext()
    
    // Format date with ordinal suffix (1st, 2nd, 3rd, etc.)
    const formatDateWithOrdinal = (date: Date) => {
      const day = date.getDate()
      const suffix = day === 1 || day === 21 || day === 31 ? 'st' : 
                     day === 2 || day === 22 ? 'nd' : 
                     day === 3 || day === 23 ? 'rd' : 'th'
      
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        year: "numeric",
      }).replace(/\d+,/, `${day}${suffix},`)
    }
    
    const dateToShow = selectedDate || new Date()
    const dateStr = formatDateWithOrdinal(dateToShow)
    
    switch (context) {
      case "past":
        return `Golden hour for ${dateStr}`
      case "future":
        // Special handling for tomorrow
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        if (dateToShow.getTime() === tomorrow.getTime()) {
          return "Tomorrow's Golden Hour"
        }
        return `Golden hour on ${dateStr}`
      case "today":
      default:
        const todayDate = new Date()
        if (dateToShow.toDateString() === todayDate.toDateString()) {
          return "Next Golden Hour Today"
        }
        return `Golden hour on ${dateStr}`
    }
  }, [smartGoldenHour?.topHeadline, selectedDate, nextGoldenHourTime])

  // Helper function to get time display text
  const getTimeDisplayText = () => {
    const context = getDateContext()

    switch (context) {
      case "past":
        return `${nextGoldenHourType} was at`
      case "future":
        return `${nextGoldenHourType} will be at`
      case "today":
      default:
        if (!nextGoldenHourIsStart) {
          return `Currently in ${nextGoldenHourType}`
        }
        return `Next ${nextGoldenHourType}`
    }
  }
  // Check if we have the essential data to display the card
  if (!nextGoldenHourTime || !autoLocation) {
    return null;
  }

  return (
    <div className="text-center mb-8">
      <div className="relative inline-flex flex-col items-center">
        <div className="relative z-10 inline-flex flex-col items-center gap-4 rounded-3xl px-4 sm:px-8 md:px-12 py-6 sm:py-8 text-foreground w-full max-w-2xl mx-auto shadow-2xl border border-amber-200/40 overflow-hidden">
          {/* Mountain Sunset Background */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Sky gradient */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-sky-700 via-orange-300 to-red-500"></div>

            {/* Sun */}
            <div className="absolute top-8 right-12 w-16 h-16 bg-yellow-300 rounded-full shadow-lg shadow-yellow-400/50"></div>

            {/* Mountain layers */}
            <div className="absolute bottom-0 left-0 w-full h-2/3">
              {/* Back mountains */}
              <div
                className="absolute bottom-0 left-0 w-full h-full bg-gray-900 opacity-80"
                style={{
                  clipPath:
                    "polygon(0% 100%, 10% 60%, 25% 40%, 40% 65%, 55% 35%, 70% 55%, 85% 30%, 100% 50%, 100% 100%)",
                }}
              ></div>

              {/* Middle mountains */}
              <div
                className="absolute bottom-0 left-0 w-full h-5/6 bg-gray-800 opacity-85"
                style={{
                  clipPath:
                    "polygon(0% 100%, 15% 50%, 30% 70%, 45% 45%, 60% 65%, 75% 40%, 90% 60%, 100% 35%, 100% 100%)",
                }}
              ></div>

              {/* Front mountains */}
              <div
                className="absolute bottom-0 left-0 w-full h-2/3 bg-gray-900 opacity-95"
                style={{
                  clipPath:
                    "polygon(0% 100%, 5% 70%, 20% 45%, 35% 60%, 50% 30%, 65% 50%, 80% 25%, 95% 40%, 100% 20%, 100% 100%)",
                }}
              ></div>
            </div>

            {/* Dark gradient overlay for text readability - improved contrast */}
            <div className="absolute bottom-0 left-0 w-full h-3/4 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
          </div>

          {/* Card content with improved contrast */}
          <div className="relative z-20">
            <div className="relative">
              <Sun className="w-12 h-12 text-yellow-300 animate-pulse" aria-hidden="true" />
              {/* Subtle glow effect */}
              <div className="absolute inset-0 w-12 h-12 bg-yellow-400/50 rounded-full blur-lg animate-pulse"></div>
            </div>
            <div className={`${
              contextualMessage.length > 30 
                ? "text-sm sm:text-base md:text-lg" 
                : "text-lg sm:text-xl md:text-2xl"
            } font-bold text-yellow-100 tracking-wider uppercase drop-shadow-lg px-2`}>
              {contextualMessage.toUpperCase()}
            </div>

            {autoLocation && (
              <div className="flex items-center justify-center gap-2 text-sm text-yellow-100 mt-2 mb-4 drop-shadow-lg">
                <MapPin className="w-4 h-4 text-yellow-300" aria-hidden="true" />
                <span className="font-medium text-white">
                  in {LocationDisplayUtils.getShortDisplayName(autoLocation)}
                </span>
              </div>
            )}

            <div className="flex flex-col items-center gap-1">
              <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-center leading-none tracking-tight text-white drop-shadow-xl">
                {nextGoldenHourTime}
              </div>
              {nextGoldenHourEndTime && (
                <div className="text-base sm:text-lg md:text-xl font-medium text-center text-yellow-100 drop-shadow-lg">
                  to {nextGoldenHourEndTime}
                </div>
              )}
            </div>

            {/* IMMEDIATE VISIBLE TEST - Force show EXACT SPECIFICATION */}
            {smartGoldenHour && smartGoldenHour.topHeadline ? (
              <div className="text-center space-y-3 p-4 bg-green-900/30 rounded-lg border border-green-400/50">
                <div className="text-green-200 text-xs font-bold">
                  ✅ EXACT SPECIFICATION WORKING!
                </div>
                <div className="text-lg font-bold text-white">
                  {smartGoldenHour.topHeadline}
                </div>
                <div className="text-sm text-yellow-200 drop-shadow-lg">
                  {smartGoldenHour.subHeadline?.location}
                </div>
                <div 
                  className="text-lg sm:text-xl font-bold text-white drop-shadow-xl"
                  dangerouslySetInnerHTML={{ __html: smartGoldenHour.subHeadline?.timeDisplay || '' }}
                />
                {smartGoldenHour.countdown?.show && (
                  <div className="text-base text-blue-200">
                    {smartGoldenHour.countdown.text}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-2 p-4 bg-red-900/30 rounded-lg border border-red-400/50">
                <div className="text-red-200 text-xs font-bold">
                  ❌ EXACT SPECIFICATION NOT ACTIVE
                </div>
                <div className="text-lg sm:text-xl md:text-2xl font-semibold text-yellow-100 drop-shadow-lg capitalize">
                  {getTimeDisplayText()}
                </div>
                <div className="text-xs text-red-300">
                  Using fallback display system
                </div>
              </div>
            )}
            
            {/* FORCE VISIBLE TEST - Always show for debugging */}
            <div className="text-xs text-red-300 bg-red-900/20 px-2 py-1 rounded mt-2 border border-red-500/30">
              🎯 EXACT SPEC TEST: {smartGoldenHour ? 'DATA RECEIVED!' : 'NO DATA YET'}<br/>
              {smartGoldenHour && smartGoldenHour.topHeadline && (
                <>
                  Top Headline: {smartGoldenHour.topHeadline}<br/>
                  Location: {smartGoldenHour.subHeadline?.location}<br/>
                  Countdown: {smartGoldenHour.countdown?.text}<br/>
                  Morning Ref: {smartGoldenHour.morningReference?.substring(0, 40)}...
                </>
              )}
              {!smartGoldenHour && (
                <>Location: {autoLocation ? `${autoLocation.city}, ${autoLocation.country}` : 'Not detected'}<br/>
                Golden Hour Type: {nextGoldenHourType || 'Not set'}</>
              )}
            </div>

            <div className="text-base sm:text-lg md:text-xl font-medium text-center text-yellow-50 drop-shadow-lg">
              {(() => {
                const context = getDateContext()

                if (context === "past") {
                  return (
                    <div className="text-base sm:text-lg md:text-xl font-medium text-yellow-100 drop-shadow-lg">
                      {nextGoldenHourTime} - {nextGoldenHourEndTime}
                    </div>
                  )
                }

                if (context === "future") {
                  const futureDate = selectedDate ? new Date(selectedDate) : new Date()
                  const today = new Date()
                  const tomorrow = new Date(today)
                  tomorrow.setDate(tomorrow.getDate() + 1)
                  
                  const diffTime = Math.abs(futureDate.getTime() - today.getTime())
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  
                  let timeText = "";
                  if (futureDate.getTime() === tomorrow.getTime()) {
                    timeText = "Tomorrow"
                  } else {
                    timeText = `In ${diffDays} ${diffDays === 1 ? "day" : "days"}`
                  }

                  return (
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-xl">
                        {timeText}
                      </div>
                      <div className="text-sm text-yellow-200 drop-shadow-lg px-3 py-1 bg-black/20 rounded-lg border border-yellow-400/30">
                        🌅 {nextGoldenHourTime} - {nextGoldenHourEndTime}
                      </div>
                    </div>
                  )
                }

                // Today's logic
                if (nextGoldenHour.includes("starts tomorrow")) {
                  return nextGoldenHour
                }

                // Always show countdown timer for today's context
                if (nextGoldenHourTargetTime) {
                  return (
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-xl">
                        <CountdownTimer 
                          targetTime={nextGoldenHourTargetTime} 
                          isStart={nextGoldenHourIsStart}
                          type={nextGoldenHourType}
                        />
                      </div>
                      
                      {/* Show additional info when currently in golden hour */}
                      {!nextGoldenHourIsStart && (
                        <div className="text-sm text-yellow-200 drop-shadow-lg px-4 py-2 bg-black/20 backdrop-blur-sm rounded-lg border border-yellow-400/30">
                          🌅 Golden Hour is happening right now!
                        </div>
                      )}
                    </div>
                  )
                }
                
                // Fallback for when no target time is available
                return (
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-xl">
                      <span className="animate-pulse">calculating...</span>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* EXACT SPECIFICATION: Morning Reference Line */}
            {smartGoldenHour && smartGoldenHour.morningReference && (
              <div className="mt-4 text-center">
                <div className="inline-block px-4 py-2 bg-black/20 backdrop-blur-sm rounded-lg border border-blue-400/30">
                  <div className="text-sm text-blue-200 drop-shadow-lg font-medium">
                    {smartGoldenHour.morningReference}
                  </div>
                </div>
              </div>
            )}

            {autoLocation && (
              <div className="flex flex-col items-center gap-2 text-sm text-yellow-100 mt-2 drop-shadow-lg">
                {/* Share Button - Re-enabled with fixes */}
                <div className="mt-3">
                  <ShareButton
                    title={`Golden Hour Times in ${autoLocation.city}`}
                    description={`Perfect golden hour photography times for ${autoLocation.city}. ${getTimeDisplayText()} ${nextGoldenHourTime}${nextGoldenHourEndTime ? ` to ${nextGoldenHourEndTime}` : ""}.`}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                    location={`${autoLocation.city}, ${autoLocation.country}`}
                    eventDate={nextGoldenHourTargetTime ? nextGoldenHourTargetTime.toISOString().split('T')[0] : undefined}
                    eventTime={nextGoldenHourTargetTime ? nextGoldenHourTargetTime.toTimeString().split(' ')[0] : undefined}
                  />
                </div>

                {weatherLoading ? (
                  <div className="flex items-center gap-2 text-xs text-yellow-100" role="status" aria-live="polite">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span>Loading weather data...</span>
                  </div>
                ) : weatherData ? (
                  <div className="flex flex-col items-center gap-1 text-xs text-yellow-100">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium">{weatherData.temp}°C</span>
                      <span className="text-white capitalize">{weatherData.description}</span>
                      <span className="text-white">Clouds: {weatherData.clouds}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white">Visibility: {weatherData.visibility}km</span>
                      <span className="text-white">Humidity: {weatherData.humidity}%</span>
                      <span className="text-white">Wind: {weatherData.windSpeed}m/s</span>
                    </div>
                    {photographyConditions && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-700/30 text-green-50 border-green-500/40"
                        >
                          Golden Hour: {photographyConditions.goldenHourQuality}
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-blue-700/30 text-blue-50 border-blue-500/40">
                          Blue Hour: {photographyConditions.blueHourQuality}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-purple-700/30 text-purple-50 border-purple-500/40"
                        >
                          Score: {photographyConditions.overallScore}/100
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-yellow-200">Weather data unavailable</div>
                )}

                {autoLocation.accuracy && <div className="text-xs text-yellow-200">{autoLocation.accuracy}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
