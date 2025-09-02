"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sunrise, Sunset, Sun } from "lucide-react"

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
}

interface TimeCardsProps {
  times: GoldenHourTimes | null
}

export const TimeCards = React.memo(function TimeCards({ times }: TimeCardsProps) {
  if (!times) return null

  return (
    <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Sunrise className="w-5 h-5 text-orange-500" aria-hidden="true" />
            Sun Times
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
            <span className="font-medium text-orange-800">Sunrise</span>
            <span className="font-mono text-lg text-orange-600">{times.sunrise}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
            <span className="font-medium text-orange-800">Sunset</span>
            <span className="font-mono text-lg text-orange-600">{times.sunset}</span>
          </div>
        </CardContent>
      </Card>

      {/* Golden Hours card removed - Evening Golden Hour display removed as requested */}

      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Sunset className="w-5 h-5 text-blue-500" aria-hidden="true" />
            Blue Hours
          </CardTitle>
          <CardDescription>
            Perfect for cityscapes and architectural photography with balanced ambient and artificial light
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-800 mb-2">Morning Blue Hour</div>
              <div className="font-mono text-lg text-blue-600">
                {times.blueHourMorning.start} - {times.blueHourMorning.end}
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-800 mb-2">Evening Blue Hour</div>
              <div className="font-mono text-lg text-blue-600">
                {times.blueHourEvening.start} - {times.blueHourEvening.end}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
