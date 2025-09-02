import React, { memo } from 'react'
import type { LocationData } from '@/lib/location-service'

interface PageHeaderProps {
  autoLocation: LocationData | null
}

export const PageHeader = memo(function PageHeader({ autoLocation }: PageHeaderProps) {
  return (
    <>
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
        {autoLocation 
          ? `Golden Hour in ${autoLocation.city}, ${autoLocation.country}`
          : "Magic / Golden Hour Calculator"}
      </h1>
      <p className="text-center text-muted-foreground mb-8 text-lg">
        {autoLocation
          ? `Discover the perfect lighting moments for photography in ${autoLocation.city}`
          : "Calculate the perfect time for stunning photography lighting anywhere in the world"}
      </p>
    </>
  )
})