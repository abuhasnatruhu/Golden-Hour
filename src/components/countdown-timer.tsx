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
  const lastTargetTimeRef = useRef<Date | null>(null)

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!targetTime || isNaN(targetTime.getTime())) {
      setTimeString("")
      return
    }

    // Always update if targetTime changed, but prevent unnecessary recalculations
    const targetTimeMs = targetTime.getTime()
    if (lastTargetTimeRef.current && 
        Math.abs(lastTargetTimeRef.current.getTime() - targetTimeMs) < 1000) {
      return // Skip if target time changed by less than 1 second
    }
    
    lastTargetTimeRef.current = targetTime
    console.log('⏱️ CountdownTimer: New target time set:', targetTime.toISOString())

    const updateCountdown = () => {
      try {
        const now = new Date()
        const diff = targetTimeMs - now.getTime()
        
        console.log('⏱️ CountdownTimer: Update at', now.toISOString(), 'diff:', diff, 'ms')
        
        if (diff <= 0) {
          const nowString = isStart ? "starts now" : "ends now"
          setTimeString(nowString)
          console.log('⏱️ CountdownTimer: Target reached:', nowString)
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
        
        let newTimeString = ""
        const prefix = isStart ? "starts" : "ends"
        
        if (days > 0) {
          newTimeString = `${prefix} in ${days}d ${hours}h ${minutes}m ${seconds}s`
        } else if (hours > 0) {
          newTimeString = `${prefix} in ${hours}h ${minutes}m ${seconds}s`
        } else if (minutes > 0) {
          newTimeString = `${prefix} in ${minutes}m ${seconds}s`
        } else {
          newTimeString = `${prefix} in ${seconds}s`
        }
        
        setTimeString(newTimeString)
        console.log('⏱️ CountdownTimer: Time string updated:', newTimeString)
      } catch (error) {
        console.error('CountdownTimer error:', error)
        setTimeString("calculation error")
      }
    }

    // Initial update
    updateCountdown()

    // Update every second
    intervalRef.current = setInterval(updateCountdown, 1000)
    console.log('⏱️ CountdownTimer: Interval started')

    return () => {
      if (intervalRef.current) {
        console.log('⏱️ CountdownTimer: Cleaning up interval')
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [targetTime, isStart])

  if (!timeString) {
    return <span>calculating...</span>
  }

  return <span>{timeString}</span>
})