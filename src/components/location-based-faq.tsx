"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, HelpCircle, MapPin, Clock, Camera, Sun } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface LocationData {
  city: string
  country: string
  state?: string
  region?: string
  lat: number
  lon: number
  timezone: string
}

interface FAQItem {
  id: string
  question: string
  answer: string
  category: 'timing' | 'weather' | 'equipment' | 'location' | 'general'
  icon: React.ReactNode
}

interface LocationBasedFAQProps {
  location: LocationData
  goldenHourTimes?: {
    sunrise: string
    sunset: string
    goldenHourMorning: { start: string; end: string }
    goldenHourEvening: { start: string; end: string }
  }
}

export function LocationBasedFAQ({ location, goldenHourTimes }: LocationBasedFAQProps) {
  console.log('LocationBasedFAQ component called with:', { location, goldenHourTimes })
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [faqs, setFaqs] = useState<FAQItem[]>([])

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const generateLocationBasedFAQs = (location: LocationData): FAQItem[] => {
    console.log('🔍 generateLocationBasedFAQs called with location:', location)
    const { city, country, state, lat, timezone } = location
    const locationName = state ? `${city}, ${state}, ${country}` : `${city}, ${country}`
    console.log('🔍 locationName:', locationName, 'lat:', lat, 'timezone:', timezone)
    
    // Determine hemisphere and climate characteristics
    const isNorthernHemisphere = lat > 0
    const isNearEquator = Math.abs(lat) < 23.5
    const isHighLatitude = Math.abs(lat) > 60
    
    // Determine season-specific advice based on hemisphere
    const currentMonth = new Date().getMonth() + 1
    const isWinter = isNorthernHemisphere ? (currentMonth >= 12 || currentMonth <= 2) : (currentMonth >= 6 && currentMonth <= 8)
    const isSummer = isNorthernHemisphere ? (currentMonth >= 6 && currentMonth <= 8) : (currentMonth >= 12 || currentMonth <= 2)
    
    const baseFAQs: FAQItem[] = [
      {
        id: 'best-time-location',
        question: `What's the best time for photography in ${locationName}?`,
        answer: `For ${locationName}, the golden hour typically occurs ${goldenHourTimes ? `from ${goldenHourTimes.goldenHourMorning.start} to ${goldenHourTimes.goldenHourMorning.end} in the morning and ${goldenHourTimes.goldenHourEvening.start} to ${goldenHourTimes.goldenHourEvening.end} in the evening` : 'around sunrise and sunset'}. ${isHighLatitude ? 'Due to the high latitude, golden hour can last much longer during certain seasons, especially in summer.' : isNearEquator ? 'Being close to the equator, golden hour is relatively consistent year-round but shorter in duration.' : 'The timing varies throughout the year, with longer golden hours in winter and shorter ones in summer.'} Consider the local timezone (${timezone}) when planning your shoots.`,
        category: 'timing',
        icon: <Clock className="w-4 h-4" />
      },
      {
        id: 'weather-patterns',
        question: `What weather conditions should I expect in ${city}?`,
        answer: `${city}'s weather patterns significantly affect photography conditions. ${isNearEquator ? 'Being near the equator, expect consistent temperatures but potential for afternoon thunderstorms.' : isHighLatitude ? 'High latitude locations often have dramatic weather changes and extended daylight hours in summer.' : 'Mid-latitude locations typically have four distinct seasons with varying photography conditions.'} ${isSummer ? 'Summer months may bring haze and heat shimmer that can affect image quality.' : isWinter ? 'Winter conditions may provide crisp, clear air but shorter daylight hours.' : 'Spring and autumn often provide the most stable conditions for photography.'} Always check local weather forecasts before your shoot.`,
        category: 'weather',
        icon: <Sun className="w-4 h-4" />
      },
      {
        id: 'local-photography-spots',
        question: `Where are the best photography locations in ${city}?`,
        answer: `${city} offers unique photography opportunities. ${isHighLatitude ? 'High latitude locations are excellent for aurora photography and dramatic landscapes.' : 'Look for elevated viewpoints, waterfront areas, and historic districts.'} Consider iconic landmarks, natural features, and local architecture that represent the character of ${locationName}. ${lat > 0 ? 'Northern locations' : 'Southern locations'} often have different lighting characteristics that can enhance your compositions. Research local photography groups and online communities for insider tips on hidden gems and optimal shooting locations.`,
        category: 'location',
        icon: <MapPin className="w-4 h-4" />
      },
      {
        id: 'equipment-recommendations',
        question: `What camera equipment works best in ${city}'s conditions?`,
        answer: `For ${locationName}'s conditions, consider: ${isHighLatitude ? 'Cold weather gear and extra batteries for extended shoots in harsh conditions.' : isNearEquator ? 'Heat protection for equipment and UV filters due to intense sunlight.' : 'Weather-sealed equipment for variable conditions.'} A sturdy tripod is essential for golden hour and blue hour photography. ${isWinter ? 'In winter conditions, allow equipment to acclimate to temperature changes gradually.' : 'In warmer months, protect gear from humidity and dust.'} Wide-angle lenses capture expansive landscapes, while telephoto lenses help isolate subjects during golden hour. Don't forget lens cleaning supplies and backup memory cards.`,
        category: 'equipment',
        icon: <Camera className="w-4 h-4" />
      },
      {
        id: 'seasonal-considerations',
        question: `How do seasons affect photography in ${locationName}?`,
        answer: `Seasonal changes in ${locationName} create diverse photography opportunities. ${isNorthernHemisphere ? 'Spring brings blooming flowers and fresh greenery, summer offers long days and vibrant colors, autumn provides stunning foliage, and winter creates minimalist landscapes.' : 'Seasons are reversed in the Southern Hemisphere - summer occurs during December-February with longer days, while winter (June-August) offers shorter days and different lighting.'} ${isHighLatitude ? 'Extreme seasonal variations mean summer can have nearly 24-hour daylight while winter may have very limited daylight hours.' : isNearEquator ? 'Seasonal changes are minimal, with wet and dry seasons being more significant than temperature variations.' : 'Four distinct seasons provide varied photography conditions throughout the year.'} Plan your visits according to the specific look you want to achieve.`,
        category: 'timing',
        icon: <Sun className="w-4 h-4" />
      },
      {
        id: 'local-regulations',
        question: `Are there any photography restrictions in ${city}?`,
        answer: `When photographing in ${locationName}, be aware of local regulations and cultural sensitivities. ${country === 'United States' ? 'In the US, most public spaces allow photography, but some federal buildings and military installations may have restrictions.' : country === 'France' ? 'In France, be respectful when photographing people and avoid commercial photography in some tourist areas without permits.' : country === 'Japan' ? 'In Japan, always ask permission before photographing people and be aware that some temples and shrines prohibit photography.' : 'Research local photography laws and cultural norms before your visit.'} Always respect private property, obtain necessary permits for commercial work, and be mindful of local customs. Some locations may require special permissions for drone photography or tripod use in crowded areas.`,
        category: 'general',
        icon: <HelpCircle className="w-4 h-4" />
      }
    ]

    console.log('🔍 generateLocationBasedFAQs returning:', baseFAQs.length, 'FAQs')
    return baseFAQs
  }

  useEffect(() => {
    console.log('🔍 LocationBasedFAQ useEffect triggered', { location, goldenHourTimes, faqsLength: faqs.length })
    if (location) {
      const locationFAQs = generateLocationBasedFAQs(location)
      console.log('🔍 Generated FAQs:', locationFAQs.length, 'items')
      setFaqs(locationFAQs)
    }
  }, [location, goldenHourTimes])

  console.log('🔍 LocationBasedFAQ render check:', { hasLocation: !!location, faqsLength: faqs.length })
  
  if (!location || faqs.length === 0) {
    console.log('🔍 LocationBasedFAQ returning null:', { hasLocation: !!location, faqsLength: faqs.length, location, faqs })
    return null
  }
  
  console.log('🔍 LocationBasedFAQ SHOULD RENDER - all conditions met:', { hasLocation: !!location, faqsLength: faqs.length })

  const categories = {
    timing: { label: 'Timing & Planning', color: 'bg-blue-100 text-blue-800' },
    weather: { label: 'Weather & Conditions', color: 'bg-orange-100 text-orange-800' },
    location: { label: 'Location Specific', color: 'bg-green-100 text-green-800' },
    equipment: { label: 'Equipment & Gear', color: 'bg-purple-100 text-purple-800' },
    general: { label: 'General Tips', color: 'bg-gray-100 text-gray-800' }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto" style={{
      backgroundColor: '#ff0000',
      border: '10px solid #00ff00',
      minHeight: '500px',
      zIndex: 99999,
      position: 'relative',
      display: 'block',
      visibility: 'visible',
      opacity: 1,
      margin: '50px auto',
      padding: '50px'
    }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <HelpCircle className="w-5 h-5 text-blue-500" />
          Photography FAQ for {location.city}, {location.country}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Location-specific answers to common photography questions
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {faqs.map((faq) => {
          const isExpanded = expandedItems.has(faq.id)
          const categoryInfo = categories[faq.category]
          
          return (
            <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                className="w-full p-4 text-left justify-between hover:bg-gray-50 h-auto"
                onClick={() => toggleExpanded(faq.id)}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    {faq.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 text-left">
                      {faq.question}
                    </h3>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </Button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                      <p className="text-gray-700 leading-relaxed mt-3">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}