import type { LocationData } from "@/lib/location-service"

export function generateStructuredDataScript(location: LocationData, date: Date = new Date()): string {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Golden Hour Calculator",
    description: `Calculate golden hour and blue hour times for ${location.city}, ${location.country}. Professional photography tool with interactive maps, sun position tracking, and real-time lighting predictions.`,
    url: "https://goldenhour-calculator.vercel.app",
    applicationCategory: "Photography",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Golden hour calculation",
      "Blue hour calculation",
      "Interactive maps",
      "Sun position tracking",
      "Location auto-detection",
      "Real-time updates",
      "Photography tips",
    ],
    screenshot: "https://goldenhour-calculator.vercel.app/screenshot.jpg",
    author: {
      "@type": "Organization",
      name: "Golden Hour Calculator",
    },
    location: {
      "@type": "Place",
      name: `${location.city}, ${location.country}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: location.city,
        addressCountry: location.country,
        addressRegion: location.state || location.country,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: location.lat,
        longitude: location.lon,
      },
    },
    dateModified: date.toISOString(),
    inLanguage: "en-US",
    isAccessibleForFree: true,
    keywords: [
      "golden hour calculator",
      "blue hour calculator",
      "photography lighting",
      "sunrise sunset times",
      "photography planning",
      location.city.toLowerCase(),
      location.country.toLowerCase(),
    ].join(", "),
  }

  return `<script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>`
}

export function generateBreadcrumbScript(pathname: string, location: LocationData): string {
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://goldenhour-calculator.vercel.app",
    },
  ]

  // Add location-specific breadcrumb if we have location data
  if (location && location.city) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 2,
      name: `${location.city}, ${location.country}`,
      item: `https://goldenhour-calculator.vercel.app${pathname}`,
    })
  }

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  }

  return `<script type="application/ld+json">${JSON.stringify(breadcrumbStructuredData, null, 2)}</script>`
}

export function generateLocationStructuredData(location: LocationData, date: Date = new Date()) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${location.city}, ${location.country}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: location.city,
      addressCountry: location.country,
      addressRegion: location.state || location.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: location.lat,
      longitude: location.lon,
    },
    description: `Golden hour and blue hour times for ${location.city}, ${location.country}. Professional photography planning with precise sun position calculations.`,
    url: `https://goldenhour-calculator.vercel.app/location/${encodeURIComponent(location.city.toLowerCase())}-${encodeURIComponent(location.country.toLowerCase())}`,
    dateModified: date.toISOString(),
  }
}

export function generatePhotographyEventStructuredData(
  location: LocationData,
  eventType: "golden-hour" | "blue-hour" | "sunrise" | "sunset",
  startTime: Date,
  endTime: Date,
) {
  const eventNames = {
    "golden-hour": "Golden Hour",
    "blue-hour": "Blue Hour",
    sunrise: "Sunrise",
    sunset: "Sunset",
  }

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${eventNames[eventType]} in ${location.city}`,
    description: `${eventNames[eventType]} photography session in ${location.city}, ${location.country}. Perfect lighting conditions for outdoor photography.`,
    startDate: startTime.toISOString(),
    endDate: endTime.toISOString(),
    location: {
      "@type": "Place",
      name: `${location.city}, ${location.country}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: location.city,
        addressCountry: location.country,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: location.lat,
        longitude: location.lon,
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Golden Hour Calculator",
      url: "https://goldenhour-calculator.vercel.app",
    },
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    isAccessibleForFree: true,
    keywords: `${eventType}, photography, ${location.city}, lighting, outdoor photography`,
  }
}
