"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  MapPin,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Sun,
  Clock,
  Mountain,
  Satellite,
  Maximize,
  Play,
  Pause,
} from "lucide-react"
import { sunCalculator } from "../lib/sun-calculator"

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false })
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false })
const Polygon = dynamic(() => import("react-leaflet").then((mod) => mod.Polygon), { ssr: false })

// Import Leaflet CSS
import "leaflet/dist/leaflet.css"

// Type definitions for react-leaflet props
type LatLngTuple = [number, number]
type MapContainerPropsType = {
  center: LatLngTuple
  zoom: number
  style: React.CSSProperties
  children: React.ReactNode
  ref?: React.RefObject<any>
  whenReady?: () => void
}

type CirclePropsType = {
  center: LatLngTuple
  radius: number
  pathOptions?: {
    color?: string
    fillColor?: string
    fillOpacity?: number
    weight?: number
  }
  children?: React.ReactNode
}

type MarkerPropsType = {
  position: LatLngTuple
  children?: React.ReactNode
}

// Fix for default markers in Leaflet
const createIcon = () => {
  if (typeof window !== "undefined") {
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })
    })
  }
}

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

interface SunPosition {
  azimuth: number
  altitude: number
  distance: number
}

interface SunPathPoint {
  time: string
  azimuth: number
  altitude: number
  position: { lat: number; lon: number }
}

interface DayNightTerminator {
  coordinates: [number, number][]
}

interface EnhancedInteractiveMapProps {
  location: LocationData
  date: string
}

interface MapLayer {
  id: string
  name: string
  url: string
  attribution: string
  icon: React.ReactNode
}

export default function EnhancedInteractiveMap({ location, date }: EnhancedInteractiveMapProps) {
  const [sunPosition, setSunPosition] = useState<SunPosition>({ azimuth: 0, altitude: 0, distance: 0 })
  const [selectedTime, setSelectedTime] = useState<string>("12:00")
  const [mapLayer, setMapLayer] = useState<string>("street")
  const [mapKey, setMapKey] = useState<number>(0) // Force remount when location changes
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [mapLoaded, setMapLoaded] = useState<boolean>(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [sunPath, setSunPath] = useState<SunPathPoint[]>([])
  const [terminator, setTerminator] = useState<DayNightTerminator | null>(null)
  const [isSunDialVisible, setIsSunDialVisible] = useState<boolean>(true)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const mapRef = useRef<any>(null)
  const animationRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Initialize Leaflet icons when component mounts
  useEffect(() => {
    createIcon()

    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Add error handling for map loading
  useEffect(() => {
    const handleMapError = (error: any) => {
      console.error("Map loading error:", error)
      setMapLoaded(false)
    }

    window.addEventListener("maperror", handleMapError)
    return () => window.removeEventListener("maperror", handleMapError)
  }, [])

  const mapLayers: MapLayer[] = [
    {
      id: "street",
      name: "Street",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      id: "satellite",
      name: "Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution:
        "&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      icon: <Satellite className="w-4 h-4" />,
    },
    {
      id: "terrain",
      name: "Terrain",
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      icon: <Mountain className="w-4 h-4" />,
    },
    {
      id: "dark",
      name: "Dark",
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      icon: <MapPin className="w-4 h-4" />,
    },
  ]

  const timeOptions = [
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
  ]

  const getCurrentTime = () => {
    const now = new Date()
    return now.toTimeString().slice(0, 5) // Returns HH:MM format
  }

  useEffect(() => {
    // Force map remount when location changes
    setMapKey((prev) => prev + 1)
    setMapLoaded(false)
  }, [location])

  const parsedDate = useMemo(() => {
    try {
      if (!date || typeof date !== "string" || date.trim() === "") {
        console.log("[v0] No valid date provided, using current date")
        return new Date()
      }

      // Parse date string more reliably
      const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      if (dateMatch) {
        const [, year, month, day] = dateMatch
        const targetDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))

        if (isNaN(targetDate.getTime())) {
          console.error("[v0] Invalid parsed date, using current date")
          return new Date()
        }

        console.log("[v0] Successfully parsed date:", {
          original: date,
          parsed: targetDate.toISOString().split("T")[0],
        })
        return targetDate
      } else {
        // Fallback to direct parsing
        const targetDate = new Date(date)
        if (isNaN(targetDate.getTime())) {
          console.error("[v0] Invalid date format, using current date")
          return new Date()
        }
        return targetDate
      }
    } catch (error) {
      console.error("[v0] Error parsing date:", error)
      return new Date()
    }
  }, [date])

  const targetDateTime = useMemo(() => {
    try {
      const timeMatch = selectedTime.match(/^(\d{1,2}):(\d{2})$/)
      if (!timeMatch) {
        console.error("[v0] Invalid time format:", selectedTime)
        return parsedDate
      }

      const [, hoursStr, minutesStr] = timeMatch
      const hours = Number.parseInt(hoursStr)
      const minutes = Number.parseInt(minutesStr)

      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.error("[v0] Invalid time values:", { hours, minutes })
        return parsedDate
      }

      const targetDate = new Date(parsedDate)
      targetDate.setHours(hours, minutes, 0, 0)

      if (isNaN(targetDate.getTime())) {
        console.error("[v0] Invalid final date after setting time")
        return parsedDate
      }

      console.log("[v0] Target date/time created:", {
        date: parsedDate.toISOString().split("T")[0],
        time: selectedTime,
        combined: targetDate.toISOString(),
      })

      return targetDate
    } catch (error) {
      console.error("[v0] Error creating target date/time:", error)
      return parsedDate
    }
  }, [parsedDate, selectedTime])

  const calculatedSunPosition = useMemo(() => {
    try {
      if (!location || !location.lat || !location.lon) {
        console.log("[v0] No valid location provided")
        return { azimuth: 0, altitude: 0, distance: 0 }
      }

      console.log("[v0] Calculating sun position:", {
        dateTime: targetDateTime.toISOString(),
        location: { lat: location.lat, lon: location.lon },
        selectedTime,
      })

      const position = sunCalculator.getSunPosition(targetDateTime, location.lat, location.lon)

      console.log("[v0] Sun position result:", {
        position,
        isAboveHorizon: position.altitude > 0,
      })

      return position
    } catch (error) {
      console.error("[v0] Error calculating sun position:", error)
      return { azimuth: 0, altitude: 0, distance: 0 }
    }
  }, [targetDateTime, location])

  useEffect(() => {
    setSunPosition(calculatedSunPosition)
  }, [calculatedSunPosition])

  const calculatedSunPath = useMemo(() => {
    try {
      if (!location || !location.lat || !location.lon) {
        return []
      }

      console.log("[v0] Calculating sun path for date:", parsedDate.toISOString().split("T")[0])
      const pathPoints = sunCalculator.getSunPath(parsedDate, location.lat, location.lon)

      const formattedPathPoints = pathPoints.map((point, index) => {
        const totalMinutes = index * 15
        const hours = Math.floor(totalMinutes / 60) % 24
        const minutes = totalMinutes % 60
        const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

        return {
          time: timeString,
          azimuth: point.azimuth,
          altitude: point.altitude,
          position: {
            lat: location.lat + 0.008 * (1 + point.altitude / 90) * Math.cos((point.azimuth * Math.PI) / 180),
            lon: location.lon + 0.008 * (1 + point.altitude / 90) * Math.sin((point.azimuth * Math.PI) / 180),
          },
        }
      })

      console.log("[v0] Sun path calculated:", formattedPathPoints.length, "points")
      return formattedPathPoints
    } catch (error) {
      console.error("[v0] Error calculating sun path:", error)
      return []
    }
  }, [parsedDate, location])

  useEffect(() => {
    setSunPath(calculatedSunPath)
  }, [calculatedSunPath])

  useEffect(() => {
    const calculateTerminator = (targetDate: Date) => {
      try {
        const coordinates: [number, number][] = []

        // Get sun times for the day
        const sunTimes = sunCalculator.getSunTimes(targetDate, location.lat, location.lon)

        // Calculate terminator line (day/night boundary) more accurately
        const julianDate = targetDate.getTime() / 86400000 + 2440587.5
        const n = julianDate - 2451545.0 + 0.0008

        // Mean longitude of the Sun
        const L = (280.466 + 0.9856474 * n) % 360

        // Mean anomaly of the Sun
        const g = (((357.528 + 0.9856003 * n) % 360) * Math.PI) / 180

        // Ecliptic longitude of the Sun
        const lambda = ((L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * Math.PI) / 180

        // Solar declination
        const delta = Math.asin(Math.sin(lambda) * Math.sin((23.439 * Math.PI) / 180))

        // Calculate terminator for each longitude
        for (let lon = -180; lon <= 180; lon += 3) {
          // Hour angle
          const hourAngle = (((targetDate.getUTCHours() + targetDate.getUTCMinutes() / 60) * 15 - lon) * Math.PI) / 180

          // Latitude of terminator point
          const lat = (Math.atan(-Math.cos(hourAngle) / Math.tan(delta)) * 180) / Math.PI

          if (!isNaN(lat) && isFinite(lat)) {
            coordinates.push([lat, lon])
          }
        }

        // Close the polygon by adding poles if needed
        if (coordinates.length > 0) {
          coordinates.push([90, coordinates[coordinates.length - 1][1]])
          coordinates.push([90, -180])
          coordinates.push([90, 180])
          coordinates.push([90, coordinates[0][1]])
        }

        setTerminator({ coordinates })
      } catch (error) {
        console.error("Error calculating terminator:", error)
        setTerminator(null)
      }
    }

    if (location && location.lat && location.lon) {
      calculateTerminator(parsedDate)
    }
  }, [parsedDate, location])

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.setView([location.lat, location.lon], 13)
    }
  }

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut()
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying)
  }

  const sunMapPosition = useMemo(() => {
    if (calculatedSunPosition.altitude <= 0) {
      console.log("[v0] Sun is below horizon, altitude:", calculatedSunPosition.altitude)
      return null
    }

    const distance = 0.008 * (1 + calculatedSunPosition.altitude / 90)
    const azimuthRad = (calculatedSunPosition.azimuth * Math.PI) / 180

    const latOffset = distance * Math.cos(azimuthRad)
    const lonOffset = distance * Math.sin(azimuthRad)

    const mapPosition = {
      lat: location.lat + latOffset,
      lon: location.lon + lonOffset,
    }

    console.log("[v0] Sun marker position:", {
      altitude: calculatedSunPosition.altitude,
      azimuth: calculatedSunPosition.azimuth,
      mapPosition,
    })

    return mapPosition
  }, [calculatedSunPosition, location])

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const period = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${period}`
  }

  const getSunIntensity = (altitude: number) => {
    if (altitude <= 0) return "Below horizon"
    if (altitude < 6) return "Blue hour"
    if (altitude < 12) return "Golden hour"
    if (altitude < 25) return "Excellent light"
    if (altitude < 45) return "Good light"
    if (altitude < 70) return "Moderate light"
    return "Harsh light"
  }

  const getShadowLength = (altitude: number) => {
    if (altitude <= 0) return "No shadow"
    const shadowLength = sunCalculator.calculateShadowLength(1, altitude)
    return shadowLength > 10 ? "Very long" : shadowLength > 5 ? "Long" : shadowLength > 2 ? "Medium" : "Short"
  }

  return (
    <Card className={`bg-white/95 backdrop-blur-sm border-0 shadow-xl ${isFullscreen ? "fixed inset-4 z-50 m-0" : ""}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Sun className="w-5 h-5 text-primary" />
              Interactive Sun Map
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {location.city}, {location.country}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={toggleFullscreen} className="h-8 w-8 p-0 bg-transparent">
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>
          Real-time sun position visualization with satellite and terrain views for optimal photography planning
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Controls */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomIn} className="h-8 w-8 p-0 bg-transparent">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomOut} className="h-8 w-8 p-0 bg-transparent">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetView} className="h-8 px-3 bg-transparent">
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button
              variant={isPlaying ? "default" : "outline"}
              size="sm"
              onClick={toggleAnimation}
              className="h-8 px-3"
            >
              {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Time:</span>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="h-8 px-2 text-sm border border-border rounded bg-background"
              disabled={isPlaying}
            >
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {formatTime(time)}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTime(getCurrentTime())}
              className="h-8 px-2 text-xs"
              disabled={isPlaying}
            >
              <Clock className="w-3 h-3 mr-1" />
              Now
            </Button>
          </div>

          <div className="flex gap-1">
            {mapLayers.map((layer) => (
              <Button
                key={layer.id}
                variant={mapLayer === layer.id ? "default" : "outline"}
                size="sm"
                onClick={() => setMapLayer(layer.id)}
                className="h-8 px-2"
                title={layer.name}
              >
                {layer.icon}
              </Button>
            ))}
          </div>
        </div>

        {/* Time Slider */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground w-16">Time:</span>
          <Slider
            value={[timeOptions.indexOf(selectedTime)]}
            onValueChange={(value) => setSelectedTime(timeOptions[value[0]])}
            max={timeOptions.length - 1}
            step={1}
            className="flex-1"
            disabled={isPlaying}
          />
          <span className="text-sm font-medium w-16">{formatTime(selectedTime)}</span>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-96 rounded-lg overflow-hidden border-2 border-border">
          {/* Compass */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/95 backdrop-blur-sm rounded-full border-2 border-border shadow-xl z-[1000]">
            <div className="relative w-full h-full">
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-sm font-bold text-red-600">N</div>
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-sm font-bold text-blue-600">
                S
              </div>
              <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-sm font-bold text-gray-600">
                W
              </div>
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-sm font-bold text-gray-600">
                E
              </div>
              <div className="absolute top-1/2 left-1/2 w-px h-8 bg-gray-400 transform -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute top-1/2 left-1/2 w-8 h-px bg-gray-400 transform -translate-x-1/2 -translate-y-1/2" />

              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-700 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10" />
            </div>
          </div>
          
          {typeof window !== "undefined" ? (
            <MapContainer
              key={mapKey}
              center={[location.lat, location.lon] as LatLngTuple}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              ref={mapRef}
              whenReady={() => {
                try {
                  const map = mapRef.current
                  if (map) {
                    setMapLoaded(true)
                    // Add event listeners for map load
                    map.on("load", () => {
                      setMapLoaded(true)
                    })
                    map.on("error", (error: any) => {
                      console.error("Map error:", error)
                      setMapLoaded(false)
                    })
                  }
                } catch (error) {
                  console.error("Map creation error:", error)
                  setMapLoaded(false)
                }
              }}
            >
              <TileLayer
                url={mapLayers.find((l) => l.id === mapLayer)?.url || mapLayers[0].url}
                eventHandlers={{
                  load: () => {
                    setMapLoaded(true)
                    console.log("Map tiles loaded successfully")
                  },
                  error: (error: any) => {
                    console.error("Tile layer error:", error)
                    setMapLoaded(false)
                  },
                }}
              />

              {/* Sun Path Visualization */}
              {sunPath.length > 0 && (
                <Polyline
                  positions={sunPath.map((point) => [point.position.lat, point.position.lon])}
                  pathOptions={{
                    color: "#fbbf24",
                    weight: 3,
                    opacity: 0.8,
                    dashArray: "10, 5",
                  }}
                />
              )}

              {/* Day/Night Terminator */}
              {terminator && terminator.coordinates.length > 0 && (
                <>
                  {/* Night side polygon */}
                  <Polygon
                    positions={[
                      ...terminator.coordinates,
                      [90, terminator.coordinates[terminator.coordinates.length - 1]?.[1] || 0],
                      [90, -180],
                      [90, 180],
                      [90, terminator.coordinates[0]?.[1] || 0],
                      [-90, terminator.coordinates[0]?.[1] || 0],
                      [-90, 180],
                      [-90, -180],
                      [-90, terminator.coordinates[terminator.coordinates.length - 1]?.[1] || 0],
                      ...terminator.coordinates.slice().reverse(),
                    ]}
                    pathOptions={{
                      color: "#1e40af",
                      fillColor: "#1e40af",
                      fillOpacity: 0.15,
                      weight: 1,
                      opacity: 0.3,
                    }}
                  />
                  {/* Terminator line */}
                  <Polyline
                    positions={terminator.coordinates}
                    pathOptions={{
                      color: "#1e40af",
                      weight: 2,
                      opacity: 0.8,
                      dashArray: "5, 5",
                    }}
                  />
                </>
              )}

              {/* Location Marker */}
              <Marker position={[location.lat, location.lon] as LatLngTuple}>
                <Popup>
                  <div className="text-sm">
                    <strong>
                      {location.city}, {location.country}
                    </strong>
                    <br />
                    Lat: {location.lat.toFixed(4)}
                    <br />
                    Lon: {location.lon.toFixed(4)}
                    <br />
                    Timezone: {location.timezone}
                  </div>
                </Popup>
              </Marker>

              {/* Sun position marker directly on the map */}
              {sunMapPosition && calculatedSunPosition.altitude > 0 && (
                <>
                  <Circle
                    center={[sunMapPosition.lat, sunMapPosition.lon] as LatLngTuple}
                    radius={150}
                    pathOptions={{
                      color: "#f59e0b",
                      fillColor: "#fbbf24",
                      fillOpacity: 0.9,
                      weight: 4,
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Sun className="w-4 h-4 text-yellow-500" />
                          <strong>Sun Position</strong>
                        </div>
                        <div>Azimuth: {calculatedSunPosition.azimuth.toFixed(1)}°</div>
                        <div>Altitude: {calculatedSunPosition.altitude.toFixed(1)}°</div>
                        <div>Time: {formatTime(selectedTime)}</div>
                        <div>Intensity: {getSunIntensity(calculatedSunPosition.altitude)}</div>
                      </div>
                    </Popup>
                  </Circle>
                  <Circle
                    center={[sunMapPosition.lat, sunMapPosition.lon] as LatLngTuple}
                    radius={50}
                    pathOptions={{
                      color: "#fbbf24",
                      fillColor: "#fef3c7",
                      fillOpacity: 1,
                      weight: 2,
                    }}
                  />
                </>
              )}
            </MapContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-blue-300 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading map...</p>
              </div>
            </div>
          )}

          {!mapLoaded && typeof window !== "undefined" && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-blue-300 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading map tiles...</p>
              </div>
            </div>
          )}



          {/* Map Layer Indicator */}
          <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {mapLayers.find((l) => l.id === mapLayer)?.name}
          </div>
        </div>

        {/* Photography Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Sun className="w-4 h-4" />
            Photography Tips for {formatTime(selectedTime)}
          </h4>
          <div className="text-sm text-blue-800 space-y-1">
            {calculatedSunPosition.altitude <= 0 && (
              <p>• Sun is below horizon - perfect for blue hour and night photography</p>
            )}
            {calculatedSunPosition.altitude > 0 && calculatedSunPosition.altitude < 10 && (
              <p>• Golden hour! Soft, warm light perfect for portraits and landscapes</p>
            )}
            {calculatedSunPosition.altitude >= 10 && calculatedSunPosition.altitude < 30 && (
              <p>• Good directional light - excellent for texture and shadow play</p>
            )}
            {calculatedSunPosition.altitude >= 30 && calculatedSunPosition.altitude < 60 && (
              <p>• Bright light - use fill flash or seek shade for portraits</p>
            )}
            {calculatedSunPosition.altitude >= 60 && <p>• Harsh overhead light - ideal for architectural details</p>}
            <p>
              • Sun direction:{" "}
              {calculatedSunPosition.azimuth >= 0 && calculatedSunPosition.azimuth < 90
                ? "Northeast (good for east-facing subjects)"
                : calculatedSunPosition.azimuth >= 90 && calculatedSunPosition.azimuth < 180
                  ? "Southeast (excellent lighting)"
                  : calculatedSunPosition.azimuth >= 180 && calculatedSunPosition.azimuth < 270
                    ? "Southwest (warm afternoon light)"
                    : "Northwest (dramatic sidelighting)"}
            </p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Click and drag to pan the map, scroll to zoom in/out</p>
          <p>• Use layer buttons to switch between street, satellite, and terrain views</p>
          <p>• Yellow circle shows approximate sun position on the map</p>
          <p>• Adjust time selector to see sun position at different times</p>
          <p>• Compass shows actual sun direction for the selected time</p>
        </div>
      </CardContent>
    </Card>
  )
}
