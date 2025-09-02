"use client"

import React, { useState, useEffect, useRef } from "react"

interface RealTimeCountdownProps {
  targetTime: Date | null
  isStart: boolean
  className?: string
}

export const RealTimeCountdown = React.memo(function RealTimeCountdown({
  targetTime,
  isStart,
  className = ""
}: RealTimeCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>("")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!targetTime) {
      setTimeLeft("calculating...")
      return
    }

    const updateCountdown = () => {
      const now = new Date()
      const target = new Date(targetTime)
      const diffInMs = target.getTime() - now.getTime()

      if (diffInMs <= 0) {
        setTimeLeft("Now!")
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        return
      }

      // Calculate time components
      const hours = Math.floor(diffInMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000)

      // Format the time string
      let timeString = ""
      if (hours > 0) {
        timeString = `${hours}h ${minutes}m ${seconds}s`
      } else if (minutes > 0) {
        timeString = `${minutes}m ${seconds}s`
      } else {
        timeString = `${seconds}s`
      }

      setTimeLeft(timeString)
    }

    // Update immediately
    updateCountdown()

    // Set up interval for real-time updates
    intervalRef.current = setInterval(updateCountdown, 1000)

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [targetTime])

  if (!targetTime) {
    return <div className={className}>calculating...</div>
  }

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className="text-base sm:text-lg md:text-xl font-medium text-yellow-100 drop-shadow-lg">
        {isStart ? "Starts in" : "Ends in"}
      </div>
      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-xl animate-pulse">
        {timeLeft}
      </div>
    </div>
  )
})