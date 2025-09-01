"use client"

import React, { useState } from "react"
import { ChevronDown, ChevronUp, HelpCircle, Camera, Sun, Clock, MapPin, Calendar, Cloud } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FAQItem {
  question: string
  answer: string
  icon: React.ElementType
  category: string
}

const faqData: FAQItem[] = [
  {
    question: "What is golden hour in photography and why is it important?",
    answer: "Golden hour is the period shortly after sunrise or before sunset when daylight is redder and softer than when the sun is higher in the sky. This magical time provides warm, diffused light that creates stunning photographs with rich colors, long shadows, and a dreamy atmosphere. Professional photographers prefer golden hour because it eliminates harsh shadows, reduces contrast, and adds a natural warm filter to images.",
    icon: Sun,
    category: "basics"
  },
  {
    question: "How long does golden hour last at different locations?",
    answer: "Golden hour duration varies significantly based on your geographic location and the season. Near the equator, golden hour typically lasts 20-30 minutes, while at higher latitudes it can extend to 60-90 minutes. During summer months, golden hour tends to be longer, especially in locations farther from the equator. Our calculator provides precise timing for your specific location, accounting for seasonal variations and geographic positioning.",
    icon: Clock,
    category: "timing"
  },
  {
    question: "What's the difference between golden hour and blue hour?",
    answer: "Golden hour occurs when the sun is between 6° above and -4° below the horizon, producing warm, golden tones. Blue hour happens when the sun is between -4° and -6° below the horizon, creating even, blue-tinted light. Blue hour is ideal for cityscape and architectural photography as artificial lights balance beautifully with the ambient sky. Both periods offer unique photographic opportunities with distinctly different color palettes and moods.",
    icon: Camera,
    category: "technical"
  },
  {
    question: "How do weather conditions affect golden hour photography?",
    answer: "Weather dramatically impacts golden hour quality. Partly cloudy conditions (20-60% cloud cover) often produce the most spectacular golden hour lighting, as clouds act as natural reflectors and diffusers. Clear skies provide consistent warm light but may lack drama. Heavy overcast can mute golden hour effects, though breaks in clouds can create dramatic light beams. High humidity can enhance atmospheric effects, while low humidity provides crisp, clear conditions.",
    icon: Cloud,
    category: "weather"
  },
  {
    question: "Can I calculate golden hour times for future dates?",
    answer: "Yes! Our golden hour calculator allows you to plan photography sessions weeks or months in advance. Simply select your desired location and future date to receive accurate sunrise, sunset, and golden hour times. This feature is essential for planning photography trips, scheduling photo shoots, or organizing special events. Remember that weather conditions can't be predicted far in advance, so always check forecasts closer to your shoot date.",
    icon: Calendar,
    category: "planning"
  },
  {
    question: "Why do golden hour times change throughout the year?",
    answer: "Golden hour times vary due to Earth's axial tilt and elliptical orbit around the sun. During summer months, the sun's path is higher, creating longer golden hours. Winter brings lower sun angles and potentially extended golden light at higher latitudes. The most dramatic changes occur during equinoxes and solstices. Our calculator accounts for these astronomical variations, providing accurate times for any date and location worldwide.",
    icon: Sun,
    category: "science"
  },
  {
    question: "What equipment do I need for golden hour photography?",
    answer: "While golden hour light is forgiving, certain equipment enhances results. A DSLR or mirrorless camera with manual controls offers maximum flexibility. A sturdy tripod is essential for stability during lower light conditions. Graduated neutral density filters help balance bright skies with darker foregrounds. A lens hood reduces flare from the low sun angle. Consider bringing a reflector to fill shadows and a weather-sealed camera bag for changing conditions.",
    icon: Camera,
    category: "equipment"
  },
  {
    question: "How accurate is the golden hour calculator for my location?",
    answer: "Our calculator uses precise astronomical algorithms and your exact GPS coordinates to provide accuracy within 1-2 minutes. We factor in atmospheric refraction, elevation, and seasonal variations. The calculations are based on clear weather conditions; actual visibility may vary with local weather. For remote locations, we recommend arriving 15-20 minutes early to account for local topography like mountains or buildings that might affect visible sunrise/sunset times.",
    icon: MapPin,
    category: "accuracy"
  }
]

export function StaticFAQ() {
  const [openItems, setOpenItems] = useState<number[]>([0, 1]) // First two items open by default
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const filteredFAQs = selectedCategory === "all" 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory)

  const categories = [
    { id: "all", label: "All Questions", icon: HelpCircle },
    { id: "basics", label: "Basics", icon: Sun },
    { id: "timing", label: "Timing", icon: Clock },
    { id: "technical", label: "Technical", icon: Camera },
    { id: "weather", label: "Weather", icon: Cloud },
    { id: "planning", label: "Planning", icon: Calendar },
  ]

  return (
    <section className="w-full py-12 md:py-16" id="faq">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about golden hour photography, timing calculations, and making the most of perfect lighting conditions
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${selectedCategory === cat.id
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                    : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((item, index) => {
            const Icon = item.icon
            const isOpen = openItems.includes(index)
            
            return (
              <Card
                key={index}
                className={`
                  border transition-all duration-200 overflow-hidden
                  ${isOpen 
                    ? 'border-amber-200 shadow-lg shadow-amber-500/10' 
                    : 'border-gray-200 hover:border-amber-200 hover:shadow-md'
                  }
                `}
              >
                <CardHeader 
                  className="cursor-pointer select-none"
                  onClick={() => toggleItem(index)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      p-2 rounded-lg transition-colors
                      ${isOpen ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}
                    `}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 pr-8">
                        {item.question}
                      </h3>
                    </div>
                    <div className={`
                      transition-transform duration-200
                      ${isOpen ? 'rotate-180' : ''}
                    `}>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </CardHeader>
                
                {isOpen && (
                  <CardContent className="pt-0 pb-6">
                    <div className="pl-14 pr-4">
                      <p className="text-gray-600 leading-relaxed">
                        {item.answer}
                      </p>
                      
                      {/* SEO Schema Markup Helper */}
                      <div className="hidden" itemScope itemType="https://schema.org/Question">
                        <div itemProp="name">{item.question}</div>
                        <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
                          <div itemProp="text">{item.answer}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Still have questions?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Our golden hour calculator is constantly improving. If you have suggestions or need help planning your perfect photography session, we're here to assist.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/25">
                  <Camera className="w-5 h-5" />
                  Start Planning Your Shoot
                </button>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
                  <MapPin className="w-5 h-5" />
                  Find Your Location
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}