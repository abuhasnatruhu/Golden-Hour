"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Sunrise, Sunset, Camera, ChevronLeft, ChevronRight, Plus, ExternalLink } from "lucide-react"
import SunCalc from "suncalc"

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

interface PhotographyCalendarProps {
  location: LocationData
  selectedDate: string
  onDateSelect: (date: string) => void
}

interface DayData {
  date: string
  sunrise: string
  sunset: string
  goldenHourMorning: { start: string; end: string }
  goldenHourEvening: { start: string; end: string }
  blueHourMorning: { start: string; end: string }
  blueHourEvening: { start: string; end: string }
  dayLength: string
  quality: number // 0-100 rating for photography
}

export function PhotographyCalendar({ location, selectedDate, onDateSelect }: PhotographyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [daysData, setDaysData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDayData, setSelectedDayData] = useState<DayData | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<
    Array<{
      date: string
      type: "morning" | "evening"
      time: string
      quality: number
    }>
  >([])

  useEffect(() => {
    generateMonthData()
  }, [currentMonth, location])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const calculateDayLength = (sunrise: Date, sunset: Date) => {
    const diff = sunset.getTime() - sunrise.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const calculateQuality = (goldenHourMorning: { start: Date; end: Date }, goldenHourEvening: { start: Date; end: Date }) => {
    const morningDuration = goldenHourMorning.end.getTime() - goldenHourMorning.start.getTime()
    const eveningDuration = goldenHourEvening.end.getTime() - goldenHourEvening.start.getTime()
    const totalDuration = morningDuration + eveningDuration
    const maxDuration = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
    return Math.min(100, Math.round((totalDuration / maxDuration) * 100))
  }

  const addToGoogleCalendar = (dayData: DayData, eventType: "morning" | "evening") => {
    const formatGoogleDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    }

    const date = new Date(dayData.date)
    let startTime: string
    let endTime: string
    let title: string

    if (eventType === "morning") {
      const [startHour, startMin] = dayData.goldenHourMorning.start.split(":").map(Number)
      const [endHour, endMin] = dayData.goldenHourMorning.end.split(":").map(Number)
      
      const start = new Date(date)
      start.setHours(startHour, startMin, 0, 0)
      const end = new Date(date)
      end.setHours(endHour, endMin, 0, 0)
      
      startTime = formatGoogleDate(start)
      endTime = formatGoogleDate(end)
      title = `Morning Golden Hour - ${location.city}`
    } else {
      const [startHour, startMin] = dayData.goldenHourEvening.start.split(":").map(Number)
      const [endHour, endMin] = dayData.goldenHourEvening.end.split(":").map(Number)
      
      const start = new Date(date)
      start.setHours(startHour, startMin, 0, 0)
      const end = new Date(date)
      end.setHours(endHour, endMin, 0, 0)
      
      startTime = formatGoogleDate(start)
      endTime = formatGoogleDate(end)
      title = `Evening Golden Hour - ${location.city}`
    }

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${startTime}/${endTime}&details=${encodeURIComponent(
      `Golden Hour photography session in ${location.city}, ${location.country}. Perfect lighting conditions for outdoor photography. Quality: ${dayData.quality}%`
    )}&location=${encodeURIComponent(`${location.city}, ${location.country}`)}`

    window.open(googleCalendarUrl, "_blank")
  }

  const addToAppleCalendar = (dayData: DayData, eventType: "morning" | "evening") => {
    const date = new Date(dayData.date)
    let startTime: Date
    let endTime: Date
    let title: string

    if (eventType === "morning") {
      const [startHour, startMin] = dayData.goldenHourMorning.start.split(":").map(Number)
      const [endHour, endMin] = dayData.goldenHourMorning.end.split(":").map(Number)

      startTime = new Date(date)
      startTime.setHours(startHour, startMin, 0, 0)
      endTime = new Date(date)
      endTime.setHours(endHour, endMin, 0, 0)
      title = `Morning Golden Hour - ${location.city}`
    } else {
      const [startHour, startMin] = dayData.goldenHourEvening.start.split(":").map(Number)
      const [endHour, endMin] = dayData.goldenHourEvening.end.split(":").map(Number)

      startTime = new Date(date)
      startTime.setHours(startHour, startMin, 0, 0)
      endTime = new Date(date)
      endTime.setHours(endHour, endMin, 0, 0)
      title = `Evening Golden Hour - ${location.city}`
    }

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    }

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Golden Hour App//EN",
      "BEGIN:VEVENT",
      `DTSTART:${formatICSDate(startTime)}`,
      `DTEND:${formatICSDate(endTime)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:Golden Hour photography session in ${location.city}, ${location.country}. Perfect lighting conditions for outdoor photography. Quality: ${dayData.quality}%`,
      `LOCATION:${location.city}, ${location.country}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n")

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${title.replace(/\s+/g, "_")}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generateMonthData = async () => {
    setLoading(true)
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const monthData: DayData[] = []
    const events: Array<{ date: string; type: "morning" | "evening"; time: string; quality: number }> = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const times = SunCalc.getTimes(date, location.lat, location.lon)
      const sunrise = times.sunrise
      const sunset = times.sunset

      const goldenHourMorning = {
        start: times.goldenHour,
        end: times.sunriseEnd,
      }
      const goldenHourEvening = {
        start: times.sunsetStart,
        end: times.dusk,
      }
      const blueHourMorning = {
        start: times.nauticalDawn,
        end: times.dawn,
      }
      const blueHourEvening = {
        start: times.dusk,
        end: times.nauticalDusk,
      }

      const quality = calculateQuality(goldenHourMorning, goldenHourEvening)

      const dayData: DayData = {
        date: date.toISOString().split("T")[0],
        sunrise: formatTime(sunrise),
        sunset: formatTime(sunset),
        goldenHourMorning: {
          start: formatTime(goldenHourMorning.start),
          end: formatTime(goldenHourMorning.end),
        },
        goldenHourEvening: {
          start: formatTime(goldenHourEvening.start),
          end: formatTime(goldenHourEvening.end),
        },
        blueHourMorning: {
          start: formatTime(blueHourMorning.start),
          end: formatTime(blueHourMorning.end),
        },
        blueHourEvening: {
          start: formatTime(blueHourEvening.start),
          end: formatTime(blueHourEvening.end),
        },
        dayLength: calculateDayLength(sunrise, sunset),
        quality,
      }

      monthData.push(dayData)

      // Add to upcoming events if date is in the future and quality is good
      if (date >= new Date() && quality >= 60) {
        events.push(
          {
            date: dayData.date,
            type: "morning",
            time: dayData.goldenHourMorning.start,
            quality,
          },
          {
            date: dayData.date,
            type: "evening",
            time: dayData.goldenHourEvening.start,
            quality,
          }
        )
      }
    }

    setDaysData(monthData)
    setUpcomingEvents(events.slice(0, 6))
    setLoading(false)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth)
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setCurrentMonth(newMonth)
  }

  const getQualityColor = (quality: number) => {
    if (quality >= 80) return "bg-green-500"
    if (quality >= 60) return "bg-yellow-500"
    if (quality >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  const getQualityLabel = (quality: number) => {
    if (quality >= 80) return "Excellent"
    if (quality >= 60) return "Good"
    if (quality >= 40) return "Fair"
    return "Poor"
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="w-full">
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Calendar className="w-5 h-5 text-primary" />
            Photography Calendar
          </CardTitle>
          <CardDescription>
            Plan your golden hour photography sessions for {location.city}, {location.country}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-lg font-semibold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading calendar data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {daysData.map((dayData, index) => {
                const isSelected = dayData.date === selectedDate
                const isToday = dayData.date === today
                
                return (
                  <div
                    key={dayData.date}
                    className={`
                      relative p-2 border rounded-lg cursor-pointer transition-all hover:bg-muted/50
                      ${isSelected ? "bg-primary text-primary-foreground" : ""}
                      ${isToday ? "ring-2 ring-primary" : ""}
                    `}
                    onClick={() => {
                      onDateSelect(dayData.date)
                      setSelectedDayData(dayData)
                    }}
                  >
                    <div className="text-sm font-medium">
                      {new Date(dayData.date).getDate()}
                    </div>
                    <div className={`w-2 h-2 rounded-full mt-1 ${getQualityColor(dayData.quality)}`}></div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Selected Day Details */}
          {selectedDayData && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {new Date(selectedDayData.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardTitle>
                <CardDescription>
                  Quality: {getQualityLabel(selectedDayData.quality)} ({selectedDayData.quality}%)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Golden Hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Sunrise className="w-4 h-4" />
                      Morning Golden Hour
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedDayData.goldenHourMorning.start} - {selectedDayData.goldenHourMorning.end}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addToGoogleCalendar(selectedDayData, "morning")}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Google
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addToAppleCalendar(selectedDayData, "morning")}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Apple
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Sunset className="w-4 h-4" />
                      Evening Golden Hour
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedDayData.goldenHourEvening.start} - {selectedDayData.goldenHourEvening.end}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addToGoogleCalendar(selectedDayData, "evening")}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Google
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addToAppleCalendar(selectedDayData, "evening")}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Apple
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm font-medium">Sunrise</p>
                    <p className="text-sm text-muted-foreground">{selectedDayData.sunrise}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sunset</p>
                    <p className="text-sm text-muted-foreground">{selectedDayData.sunset}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Day Length</p>
                    <p className="text-sm text-muted-foreground">{selectedDayData.dayLength}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Upcoming Photography Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          {event.type === "morning" ? "Morning" : "Evening"} Golden Hour
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getQualityColor(event.quality)}`}></div>
                        <span className="text-sm font-medium">{event.quality}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PhotographyCalendar
