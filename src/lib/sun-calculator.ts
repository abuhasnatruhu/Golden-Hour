import SunCalc from 'suncalc'

interface SunTimes {
  solarNoon: Date
  sunrise: Date
  sunset: Date
  sunriseEnd: Date
  sunsetStart: Date
  dawn: Date
  dusk: Date
  nauticalDawn: Date
  nauticalDusk: Date
  nightEnd: Date
  night: Date
  goldenHourEnd: Date
  goldenHour: Date // This is goldenHourStart in suncalc
}

interface SunPosition {
  azimuth: number // degrees from North (0-360)
  altitude: number // degrees above horizon (-90 to 90)
  distance: number // distance to sun in km
  declination: number // solar declination in degrees
  rightAscension: number // right ascension in degrees
  hourAngle: number // hour angle in degrees
}

interface GoldenHourPeriod {
  start: Date
  end: Date
  duration: number // in minutes
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  intensity: number // 0-100
}

interface BlueHourPeriod {
  start: Date
  end: Date
  duration: number // in minutes
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  intensity: number // 0-100
}

interface DayInfo {
  date: Date
  daylightDuration: number // in minutes
  sunTimes: SunTimes
  goldenHours: {
    morning: GoldenHourPeriod
    evening: GoldenHourPeriod
  }
  blueHours: {
    morning: BlueHourPeriod
    evening: BlueHourPeriod
  }
  sunPath: SunPosition[]
  optimalShootingTimes: {
    goldenHour: Date[]
    blueHour: Date[]
    civilTwilight: Date[]
  }
}

class SunCalculator {
  private readonly EARTH_RADIUS = 6371 // km
  private readonly SUN_DISTANCE = 149597870.7 // km (average)

  /**
   * Get precise sun times for a given date and location
   */
  getSunTimes(date: Date, lat: number, lon: number): SunTimes {
    return SunCalc.getTimes(date, lat, lon)
  }

  /**
   * Get sun position with enhanced precision
   */
  getSunPosition(date: Date, lat: number, lon: number): SunPosition {
    const position = SunCalc.getPosition(date, lat, lon)
    
    // Convert radians to degrees
    const azimuth = (position.azimuth * 180 / Math.PI + 180) % 360
    const altitude = position.altitude * 180 / Math.PI
    
    // Calculate additional astronomical parameters
    const declination = this.calculateSolarDeclination(date)
    const rightAscension = this.calculateRightAscension(date)
    const hourAngle = this.calculateHourAngle(date, lon)
    
    return {
      azimuth,
      altitude,
      distance: this.SUN_DISTANCE,
      declination,
      rightAscension,
      hourAngle
    }
  }

  /**
   * Calculate solar declination
   */
  private calculateSolarDeclination(date: Date): number {
    const dayOfYear = this.getDayOfYear(date)
    const declination = 23.45 * Math.sin(Math.PI * (284 + dayOfYear) / 365)
    return declination
  }

  /**
   * Calculate right ascension
   */
  private calculateRightAscension(date: Date): number {
    const dayOfYear = this.getDayOfYear(date)
    const rightAscension = (280.46 + 0.9856474 * dayOfYear) % 360
    return rightAscension
  }

  /**
   * Calculate hour angle
   */
  private calculateHourAngle(date: Date, longitude: number): number {
    const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60
    const hourAngle = 15 * (utcHours - 12) - longitude
    return hourAngle % 360
  }

  /**
   * Get day of year (1-366)
   */
  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0)
    const diff = date.getTime() - start.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  /**
   * Calculate golden hour periods with enhanced precision
   */
  getGoldenHourPeriods(date: Date, lat: number, lon: number): {
    morning: GoldenHourPeriod
    evening: GoldenHourPeriod
  } {
    const sunTimes = this.getSunTimes(date, lat, lon)
    
    // According to SunCalc documentation:
    // - goldenHourEnd: morning golden hour ends
    // - goldenHour: evening golden hour starts
    // We need to calculate morning golden hour start and evening golden hour end
    
    // Morning golden hour: starts before sunrise, ends at goldenHourEnd
    const morningEnd = sunTimes.goldenHourEnd // Morning golden hour end (from SunCalc)
    const morningStart = new Date(sunTimes.sunrise.getTime() - 60 * 60 * 1000) // Start 1 hour before sunrise
    
    // Evening golden hour: starts at goldenHour, ends at sunset
    const eveningStart = sunTimes.goldenHour // Evening golden hour start (from SunCalc)
    const eveningEnd = sunTimes.sunset // Evening golden hour ends at sunset
    
    const morningDuration = Math.round((morningEnd.getTime() - morningStart.getTime()) / (1000 * 60))
    const eveningDuration = Math.round((eveningEnd.getTime() - eveningStart.getTime()) / (1000 * 60))
    
    return {
      morning: {
        start: morningStart,
        end: morningEnd,
        duration: morningDuration,
        quality: this.calculateGoldenHourQuality(morningStart, morningEnd, lat, lon),
        intensity: this.calculateGoldenHourIntensity(morningStart, lat, lon)
      },
      evening: {
        start: eveningStart,
        end: eveningEnd,
        duration: eveningDuration,
        quality: this.calculateGoldenHourQuality(eveningStart, eveningEnd, lat, lon),
        intensity: this.calculateGoldenHourIntensity(eveningStart, lat, lon)
      }
    }
  }

  /**
   * Calculate blue hour periods
   */
  getBlueHourPeriods(date: Date, lat: number, lon: number): {
    morning: BlueHourPeriod
    evening: BlueHourPeriod
  } {
    const sunTimes = this.getSunTimes(date, lat, lon)
    
    // Morning blue hour (dawn to sunrise)
    const morningStart = sunTimes.dawn
    const morningEnd = sunTimes.sunrise
    
    // Evening blue hour (sunset to dusk)
    const eveningStart = sunTimes.sunset
    const eveningEnd = sunTimes.dusk
    
    return {
      morning: {
        start: morningStart,
        end: morningEnd,
        duration: Math.round((morningEnd.getTime() - morningStart.getTime()) / (1000 * 60)),
        quality: this.calculateBlueHourQuality(morningStart, morningEnd, lat, lon),
        intensity: this.calculateBlueHourIntensity(morningStart, lat, lon)
      },
      evening: {
        start: eveningStart,
        end: eveningEnd,
        duration: Math.round((eveningEnd.getTime() - eveningStart.getTime()) / (1000 * 60)),
        quality: this.calculateBlueHourQuality(eveningStart, eveningEnd, lat, lon),
        intensity: this.calculateBlueHourIntensity(eveningStart, lat, lon)
      }
    }
  }

  /**
   * Calculate golden hour quality based on sun angle and atmospheric conditions
   */
  private calculateGoldenHourQuality(start: Date, end: Date, lat: number, lon: number): 'excellent' | 'good' | 'fair' | 'poor' {
    const midTime = new Date((start.getTime() + end.getTime()) / 2)
    const position = this.getSunPosition(midTime, lat, lon)
    
    // Optimal golden hour occurs when sun is between 4-6 degrees above horizon
    const optimalAngle = position.altitude
    
    if (optimalAngle >= 4 && optimalAngle <= 6) return 'excellent'
    if (optimalAngle >= 3 && optimalAngle <= 8) return 'good'
    if (optimalAngle >= 2 && optimalAngle <= 10) return 'fair'
    return 'poor'
  }

  /**
   * Calculate golden hour intensity (0-100)
   */
  private calculateGoldenHourIntensity(time: Date, lat: number, lon: number): number {
    const position = this.getSunPosition(time, lat, lon)
    
    // Maximum intensity at 5 degrees above horizon
    const optimalAngle = 5
    const angleDiff = Math.abs(position.altitude - optimalAngle)
    
    // Intensity decreases as we move away from optimal angle
    const intensity = Math.max(0, 100 - (angleDiff * 10))
    return Math.round(intensity)
  }

  /**
   * Calculate blue hour quality
   */
  private calculateBlueHourQuality(start: Date, end: Date, lat: number, lon: number): 'excellent' | 'good' | 'fair' | 'poor' {
    const midTime = new Date((start.getTime() + end.getTime()) / 2)
    const position = this.getSunPosition(midTime, lat, lon)
    
    // Optimal blue hour occurs when sun is between -6 to -4 degrees below horizon
    const optimalAngle = position.altitude
    
    if (optimalAngle >= -6 && optimalAngle <= -4) return 'excellent'
    if (optimalAngle >= -8 && optimalAngle <= -2) return 'good'
    if (optimalAngle >= -12 && optimalAngle <= 0) return 'fair'
    return 'poor'
  }

  /**
   * Calculate blue hour intensity (0-100)
   */
  private calculateBlueHourIntensity(time: Date, lat: number, lon: number): number {
    const position = this.getSunPosition(time, lat, lon)
    
    // Maximum intensity at -5 degrees below horizon
    const optimalAngle = -5
    const angleDiff = Math.abs(position.altitude - optimalAngle)
    
    // Intensity decreases as we move away from optimal angle
    const intensity = Math.max(0, 100 - (angleDiff * 8))
    return Math.round(intensity)
  }

  /**
   * Generate sun path for the entire day
   */
  getSunPath(date: Date, lat: number, lon: number): SunPosition[] {
    const path: SunPosition[] = []
    
    // Calculate sun position every 15 minutes
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = new Date(date)
        time.setHours(hour, minute, 0, 0)
        
        const position = this.getSunPosition(time, lat, lon)
        
        // Only include positions where sun is above horizon or within 1 hour of sunrise/sunset
        const sunTimes = this.getSunTimes(date, lat, lon)
        const timeFromSunrise = Math.abs(time.getTime() - sunTimes.sunrise.getTime())
        const timeFromSunset = Math.abs(time.getTime() - sunTimes.sunset.getTime())
        
        if (position.altitude > -10 || timeFromSunrise < 60 * 60 * 1000 || timeFromSunset < 60 * 60 * 1000) {
          path.push(position)
        }
      }
    }
    
    return path
  }

  /**
   * Get comprehensive day information
   */
  getDayInfo(date: Date, lat: number, lon: number): DayInfo {
    const sunTimes = this.getSunTimes(date, lat, lon)
    const goldenHours = this.getGoldenHourPeriods(date, lat, lon)
    const blueHours = this.getBlueHourPeriods(date, lat, lon)
    const sunPath = this.getSunPath(date, lat, lon)
    
    // Calculate daylight duration
    const daylightDuration = (sunTimes.sunset.getTime() - sunTimes.sunrise.getTime()) / (1000 * 60)
    
    // Generate optimal shooting times
    const optimalShootingTimes = {
      goldenHour: [
        goldenHours.morning.start,
        goldenHours.morning.end,
        goldenHours.evening.start,
        goldenHours.evening.end
      ],
      blueHour: [
        blueHours.morning.start,
        blueHours.morning.end,
        blueHours.evening.start,
        blueHours.evening.end
      ],
      civilTwilight: [
        sunTimes.dawn,
        sunTimes.dusk
      ]
    }
    
    return {
      date,
      daylightDuration,
      sunTimes,
      goldenHours,
      blueHours,
      sunPath,
      optimalShootingTimes
    }
  }

  /**
   * Get next golden hour with precise timing
   */
  getNextGoldenHour(date: Date, lat: number, lon: number): {
    type: 'morning' | 'evening'
    start: Date
    end: Date
    timeUntil: number // minutes until start or end (depending on isCurrent)
    isCurrent: boolean
  } | null {
    const now = new Date()
    const selectedDate = new Date(date.toDateString())
    const today = new Date(now.toDateString())
    const goldenHours = this.getGoldenHourPeriods(selectedDate, lat, lon)
    
    // If selected date is today, use real-time logic
    if (selectedDate.getTime() === today.getTime()) {
      // Check if we're currently in morning golden hour
      if (now >= goldenHours.morning.start && now <= goldenHours.morning.end) {
        return {
          type: 'morning',
          start: goldenHours.morning.start,
          end: goldenHours.morning.end,
          timeUntil: Math.max(0, Math.ceil((goldenHours.morning.end.getTime() - now.getTime()) / (1000 * 60))),
          isCurrent: true
        }
      }
      
      // Check if we're currently in evening golden hour
      if (now >= goldenHours.evening.start && now <= goldenHours.evening.end) {
        return {
          type: 'evening',
          start: goldenHours.evening.start,
          end: goldenHours.evening.end,
          timeUntil: Math.max(0, Math.ceil((goldenHours.evening.end.getTime() - now.getTime()) / (1000 * 60))),
          isCurrent: true
        }
      }
      
      // Check next morning golden hour
      if (now < goldenHours.morning.start) {
        return {
          type: 'morning',
          start: goldenHours.morning.start,
          end: goldenHours.morning.end,
          timeUntil: Math.ceil((goldenHours.morning.start.getTime() - now.getTime()) / (1000 * 60)),
          isCurrent: false
        }
      }
      
      // Check next evening golden hour
      if (now < goldenHours.evening.start) {
        return {
          type: 'evening',
          start: goldenHours.evening.start,
          end: goldenHours.evening.end,
          timeUntil: Math.ceil((goldenHours.evening.start.getTime() - now.getTime()) / (1000 * 60)),
          isCurrent: false
        }
      }
      
      // If both golden hours have passed today, check tomorrow
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowGoldenHours = this.getGoldenHourPeriods(tomorrow, lat, lon)
      
      return {
        type: 'morning',
        start: tomorrowGoldenHours.morning.start,
        end: tomorrowGoldenHours.morning.end,
        timeUntil: Math.ceil((tomorrowGoldenHours.morning.start.getTime() - now.getTime()) / (1000 * 60)),
        isCurrent: false
      }
    } else {
      // For past or future dates, always show the morning golden hour as the "next" one
      // since we can't determine real-time status for non-current dates
      let timeUntil = 0
      
      if (selectedDate < today) {
        // Past dates show 0 time until (already passed)
        timeUntil = 0
      } else {
        // Future dates: calculate time from now to the golden hour start
        timeUntil = Math.ceil((goldenHours.morning.start.getTime() - now.getTime()) / (1000 * 60))
      }
      
      return {
        type: 'morning',
        start: goldenHours.morning.start,
        end: goldenHours.morning.end,
        timeUntil: Math.max(0, timeUntil),
        isCurrent: false
      }
    }
  }

  /**
   * Calculate shadow length based on sun altitude
   */
  calculateShadowLength(objectHeight: number, sunAltitude: number): number {
    if (sunAltitude <= 0) return Infinity // No shadow when sun is below horizon
    
    const altitudeRad = sunAltitude * Math.PI / 180
    return objectHeight / Math.tan(altitudeRad)
  }

  /**
   * Calculate sun direction for shadows
   */
  calculateShadowDirection(sunAzimuth: number): number {
    // Shadow direction is opposite to sun direction
    return (sunAzimuth + 180) % 360
  }
}

export const sunCalculator = new SunCalculator()
export type {
  SunTimes,
  SunPosition,
  GoldenHourPeriod,
  BlueHourPeriod,
  DayInfo
}
