import { useState, useCallback, useMemo } from 'react'
import { sunCalculator } from '@/src/lib/sun-calculator'
import type { LocationData } from '@/lib/location-service'

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
  nextGoldenHour: string
  nextGoldenHourTime: string
  nextGoldenHourEndTime: string
  nextGoldenHourType: string
  nextGoldenHourIsStart: boolean
  targetTime: Date | null
}

export function useGoldenHourCalculations() {
  const [times, setTimes] = useState<GoldenHourTimes | null>(null)
  const [nextGoldenHour, setNextGoldenHour] = useState<string>("")
  const [nextGoldenHourTime, setNextGoldenHourTime] = useState<string>("")
  const [nextGoldenHourEndTime, setNextGoldenHourEndTime] = useState<string>("")
  const [nextGoldenHourType, setNextGoldenHourType] = useState<string>("")
  const [nextGoldenHourTargetTime, setNextGoldenHourTargetTime] = useState<Date | null>(null)
  const [nextGoldenHourIsStart, setNextGoldenHourIsStart] = useState<boolean>(true)

  const calculateNextGoldenHour = useCallback((locationData: LocationData, ignoreCache = false) => {
    if (!locationData) return

    const today = new Date()
    const nextGoldenHourInfo = sunCalculator.getNextGoldenHour(today, locationData.lat, locationData.lon)

    if (nextGoldenHourInfo) {
      let timeDescription = ""
      let targetTime = nextGoldenHourInfo.start
      let isStart = true

      if (nextGoldenHourInfo.isCurrent) {
        timeDescription = `NOW! Ends in ${nextGoldenHourInfo.timeUntil} min`
        targetTime = nextGoldenHourInfo.end
        isStart = false
      } else if (nextGoldenHourInfo.timeUntil <= 60) {
        timeDescription = `In ${nextGoldenHourInfo.timeUntil} minutes`
      } else if (nextGoldenHourInfo.timeUntil <= 1440) {
        const hours = Math.floor(nextGoldenHourInfo.timeUntil / 60)
        const minutes = nextGoldenHourInfo.timeUntil % 60
        timeDescription = `In ${hours}h ${minutes}m`
      } else {
        const days = Math.floor(nextGoldenHourInfo.timeUntil / 1440)
        timeDescription = `In ${days} day${days > 1 ? "s" : ""}`
      }

      setNextGoldenHour(timeDescription)
      setNextGoldenHourTime(nextGoldenHourInfo.start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: locationData.timezone,
      }))
      setNextGoldenHourEndTime(nextGoldenHourInfo.end.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: locationData.timezone,
      }))
      setNextGoldenHourType(nextGoldenHourInfo.type === "morning" ? "Morning Golden Hour" : "Evening Golden Hour")
      setNextGoldenHourTargetTime(targetTime)
      setNextGoldenHourIsStart(isStart)
    }
  }, [])

  const calculateGoldenHour = useCallback((locationData: LocationData, selectedDate: Date | null) => {
    if (!locationData) return

    const date = selectedDate || new Date()
    const sunTimes = sunCalculator.getSunTimes(date, locationData.lat, locationData.lon)
    const goldenHourPeriods = sunCalculator.getGoldenHourPeriods(date, locationData.lat, locationData.lon)
    const blueHourPeriods = sunCalculator.getBlueHourPeriods(date, locationData.lat, locationData.lon)

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: locationData.timezone,
      })
    }

    const calculatedTimes: GoldenHourTimes = {
      sunrise: formatTime(sunTimes.sunrise),
      sunset: formatTime(sunTimes.sunset),
      goldenHourMorning: {
        start: formatTime(goldenHourPeriods.morning.start),
        end: formatTime(goldenHourPeriods.morning.end),
      },
      goldenHourEvening: {
        start: formatTime(goldenHourPeriods.evening.start),
        end: formatTime(goldenHourPeriods.evening.end),
      },
      blueHourMorning: {
        start: formatTime(blueHourPeriods.morning.start),
        end: formatTime(blueHourPeriods.morning.end),
      },
      blueHourEvening: {
        start: formatTime(blueHourPeriods.evening.start),
        end: formatTime(blueHourPeriods.evening.end),
      },
      nextGoldenHour,
      nextGoldenHourTime,
      nextGoldenHourEndTime,
      nextGoldenHourType,
      nextGoldenHourIsStart,
      targetTime: nextGoldenHourTargetTime,
    }

    setTimes(calculatedTimes)
    return calculatedTimes
  }, [nextGoldenHour, nextGoldenHourTime, nextGoldenHourEndTime, nextGoldenHourType, nextGoldenHourIsStart, nextGoldenHourTargetTime])

  return {
    times,
    nextGoldenHour,
    nextGoldenHourTime,
    nextGoldenHourEndTime,
    nextGoldenHourType,
    nextGoldenHourTargetTime,
    nextGoldenHourIsStart,
    calculateNextGoldenHour,
    calculateGoldenHour,
  }
}