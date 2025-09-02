"use client"

import React, { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface CurrentTimeDisplayProps {
  timezone?: string
}

export const CurrentTimeDisplay = React.memo(function CurrentTimeDisplay({ timezone }: CurrentTimeDisplayProps) {
  const [currentTime, setCurrentTime] = useState<string>("--:--:--")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const updateTime = () => {
      const now = new Date()
      const timeString = timezone
        ? now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: timezone,
          })
        : now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
      setCurrentTime(timeString)
    }

    // Initial update
    updateTime()
    
    // Update every second
    const interval = setInterval(updateTime, 1000)
    
    return () => clearInterval(interval)
  }, [timezone])

  return (
    <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-6 py-3 text-foreground border border-border">
      <Clock className="w-5 h-5" />
      <span className="font-mono text-lg">{mounted ? currentTime : "--:--:--"}</span>
      {mounted && timezone && (
        <span className="text-sm text-muted-foreground">({timezone.replace("_", " ")})</span>
      )}
    </div>
  )
})