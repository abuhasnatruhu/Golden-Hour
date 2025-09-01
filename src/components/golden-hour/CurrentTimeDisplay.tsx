import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

interface CurrentTimeDisplayProps {
  formattedTime: string
  autoLocation: { city?: string; timezone?: string } | null
  mounted: boolean
}

export const CurrentTimeDisplay = memo(function CurrentTimeDisplay({ 
  formattedTime, 
  autoLocation, 
  mounted 
}: CurrentTimeDisplayProps) {
  if (!autoLocation) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Current Time in {autoLocation.city || "Selected Location"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-center">
          {formattedTime}
        </div>
        {autoLocation.timezone && (
          <div className="text-sm text-muted-foreground text-center mt-2">
            Timezone: {autoLocation.timezone}
          </div>
        )}
      </CardContent>
    </Card>
  )
})