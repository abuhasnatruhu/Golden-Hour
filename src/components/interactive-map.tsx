"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, RotateCcw, ZoomIn, ZoomOut, Layers } from "lucide-react"

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

interface InteractiveMapProps {
  location: LocationData
  date: string
}

interface SunPosition {
  azimuth: number
  altitude: number
}

export default function InteractiveMap({ location, date }: InteractiveMapProps) {
  const [sunPosition, setSunPosition] = useState<SunPosition>({ azimuth: 0, altitude: 0 })
  const [mapLoaded, setMapLoaded] = useState(false)
  const [zoom, setZoom] = useState(13)
  const [center, setCenter] = useState<[number, number]>([location.lat, location.lon])
  const [selectedTime, setSelectedTime] = useState<string>("12:00")
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate sun position calculation
    const calculateSunPosition = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      
      // Simple approximation for sun position
      const azimuth = ((hours + minutes / 60) / 24) * 360 - 90
      const altitude = Math.sin(((hours + minutes / 60 - 6) / 12) * Math.PI) * 90
      
      setSunPosition({
        azimuth: azimuth % 360,
        altitude: Math.max(0, altitude)
      })
    }

    calculateSunPosition()
    const interval = setInterval(calculateSunPosition, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [date, location])

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 1, 18))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 1, 1))
  }

  const handleResetView = () => {
    setCenter([location.lat, location.lon])
    setZoom(13)
  }

  const handleMapClick = (e: React.MouseEvent) => {
    if (!mapRef.current) return
    
    const rect = mapRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Simple coordinate calculation (in real app, this would use proper map projection)
    const lat = location.lat + (y - rect.height / 2) * 0.001
    const lon = location.lon + (x - rect.width / 2) * 0.001
    
    setCenter([lat, lon])
  }

  const timeOptions = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ]

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <MapPin className="w-5 h-5 text-primary" />
          Interactive Sun Map
        </CardTitle>
        <CardDescription>
          Visualize sun position and shadows throughout the day for optimal photography planning
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetView}
              className="h-8 px-3"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Time:</span>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="h-8 px-2 text-sm border border-border rounded bg-background"
            >
              {timeOptions.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

        <div 
          ref={mapRef}
          onClick={handleMapClick}
          className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg overflow-hidden cursor-crosshair border-2 border-border"
        >
          {/* Simulated map background */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-emerald-50 to-lime-100">
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={`h-${i}`} className="absolute w-full h-px bg-gray-400" style={{ top: `${i * 5}%` }} />
              ))}
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={`v-${i}`} className="absolute h-full w-px bg-gray-400" style={{ left: `${i * 5}%` }} />
              ))}
            </div>
          </div>

          {/* Location marker */}
          <div 
            className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: '50%', 
              top: '50%',
              animation: 'pulse 2s infinite'
            }}
          >
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-30" />
          </div>

          {/* Sun position indicator */}
          <div
            className="absolute w-2 h-2 bg-yellow-400 rounded-full border border-yellow-300 shadow-md transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              left: `${50 + Math.cos(sunPosition.azimuth * Math.PI / 180) * 30}%`,
              top: `${50 - Math.sin(sunPosition.azimuth * Math.PI / 180) * 30}%`,
              opacity: sunPosition.altitude > 0 ? 1 : 0.3,
              background: `radial-gradient(circle, #fbbf24, #f59e0b)`,
              boxShadow: "0 0 4px rgba(251, 191, 36, 0.6)"
            }}
          >
            <div className="absolute inset-0 bg-yellow-300 rounded-full animate-pulse opacity-30" />
          </div>

          {/* Shadow direction indicator */}
          {sunPosition.altitude > 0 && (
            <div
              className="absolute w-0.5 bg-gray-600 transform origin-bottom"
              style={{
                left: '50%',
                top: '50%',
                height: `${Math.min(sunPosition.altitude * 2, 80)}px`,
                transform: `translateX(-50%) rotate(${sunPosition.azimuth + 180}deg)`,
                opacity: 0.6
              }}
            />
          )}

          {/* Compass */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full border border-border shadow-lg">
            <div className="relative w-full h-full">
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-red-600">N</div>
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-blue-600">S</div>
              <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-600">W</div>
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-600">E</div>
              <div className="absolute top-1/2 left-1/2 w-px h-6 bg-gray-400 transform -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute top-1/2 left-1/2 w-6 h-px bg-gray-400 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Zoom level indicator */}
          <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
            Zoom: {zoom}
          </div>

          {/* Coordinates display */}
          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {center[0].toFixed(4)}, {center[1].toFixed(4)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="font-medium text-muted-foreground mb-1">Sun Azimuth</div>
            <div className="text-lg font-semibold text-primary">
              {sunPosition.azimuth.toFixed(1)}°
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="font-medium text-muted-foreground mb-1">Sun Altitude</div>
            <div className="text-lg font-semibold text-primary">
              {sunPosition.altitude.toFixed(1)}°
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="font-medium text-muted-foreground mb-1">Shadow Length</div>
            <div className="text-lg font-semibold text-primary">
              {sunPosition.altitude > 0 ? (1 / Math.tan(sunPosition.altitude * Math.PI / 180)).toFixed(1) : '∞'}x
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Click on the map to recenter the view</p>
          <p>• Use zoom controls to adjust the map scale</p>
          <p>• Yellow circle shows sun position, gray line shows shadow direction</p>
          <p>• Adjust time selector to see sun position at different times</p>
        </div>
      </CardContent>
    </Card>
  )
}
