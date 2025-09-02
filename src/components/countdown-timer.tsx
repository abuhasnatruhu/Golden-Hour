"use client"

import React, { useState, useEffect, useRef } from "react"

interface CountdownTimerProps {
  targetTime: Date | null
  isStart: boolean
  type: string
}

export const CountdownTimer = React.memo(function CountdownTimer({ 
  targetTime, 
  isStart, 
  type 
}: CountdownTimerProps) {
  const [timeString, setTimeString] = useState<string>("")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!targetTime) {
      setTimeString("")
      return
    }

    const updateCountdown = () => {
      const now = new Date()
      const diff = targetTime.getTime() - now.getTime()
      
      if (diff <= 0) {
        setTimeString(isStart ? "starts now" : "ends now")
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        return
      }

      const totalSeconds = Math.floor(diff / 1000)
      const days = Math.floor(totalSeconds / (24 * 60 * 60))
      const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
      const seconds = totalSeconds % 60
      
      if (days > 0) {
        // Show days with hours, minutes, seconds
        setTimeString(
          `${isStart ? "starts" : "ends"} in ${days}d ${hours}h ${minutes}m ${seconds}s`
        )
      } else if (hours > 0) {
        // Show hours, minutes, seconds
        setTimeString(
          `${isStart ? "starts" : "ends"} in ${hours}h ${minutes}m ${seconds}s`
        )
      } else if (minutes > 0) {
        // Show minutes and seconds
        setTimeString(
          `${isStart ? "starts" : "ends"} in ${minutes}m ${seconds}s`
        )
      } else {
        // Show only seconds
        setTimeString(
          `${isStart ? "starts" : "ends"} in ${seconds}s`
        )
      }
    }

    // Initial update
    updateCountdown()

    // Update every second
    intervalRef.current = setInterval(updateCountdown, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [targetTime, isStart])

  if (!timeString) {
    return <span className="animate-pulse">calculating...</span>
  }

  return <span className="animate-pulse">{timeString}</span>
})