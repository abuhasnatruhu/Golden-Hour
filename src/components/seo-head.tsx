'use client';

import { useEffect } from 'react';
import { generateStructuredDataScript, generateBreadcrumbScript } from '@/lib/metadata-generator';
import type { LocationData } from '@/lib/location-service';

interface SEOHeadProps {
  location?: LocationData;
  pathname?: string;
  date?: Date;
}

export default function SEOHead({ location, pathname = '/', date = new Date() }: SEOHeadProps) {
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      // Remove existing structured data scripts safely
      try {
        const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
        existingScripts.forEach(script => {
          if (script.textContent?.includes('GoldenHourCalculator') || 
              script.textContent?.includes('BreadcrumbList')) {
            script.remove();
          }
        });
      } catch (error) {
        console.warn('Error removing existing scripts:', error);
      }

      // Add new structured data if location is available
      if (location) {
        // Add structured data script
        try {
          const structuredDataScript = generateStructuredDataScript(location, date);
          if (structuredDataScript) {
            const scriptElement = document.createElement('div');
            scriptElement.innerHTML = structuredDataScript;
            const script = scriptElement.firstChild as HTMLScriptElement;
            if (script && document.head) {
              document.head.appendChild(script);
            }
          }
        } catch (error) {
          console.warn('Error adding structured data script:', error);
        }

        // Add breadcrumb script
        try {
          const breadcrumbScript = generateBreadcrumbScript(pathname, location);
          if (breadcrumbScript) {
            const scriptElement = document.createElement('div');
            scriptElement.innerHTML = breadcrumbScript;
            const script = scriptElement.firstChild as HTMLScriptElement;
            if (script && document.head) {
              document.head.appendChild(script);
            }
          }
        } catch (error) {
          console.warn('Error adding breadcrumb script:', error);
        }
      }

      // Update document title dynamically
      if (location) {
        document.title = `Golden Hour Times in ${location.city}, ${location.country} - Photography Calculator`
      } else {
        document.title = "Golden Hour Calculator - Perfect Photography Lighting Times | Free Tool"
      }

      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          location
            ? `Get precise golden hour, blue hour, sunrise and sunset times for ${location.city}, ${location.country}. Professional photography planning tool with real-time weather integration and interactive maps.`
            : "Calculate golden hour and blue hour times for any location worldwide. Professional photography tool with interactive maps, sun position tracking, and real-time lighting predictions. Free golden hour calculator for photographers."
        )
      }

      // Update Open Graph title
      const ogTitle = document.querySelector('meta[property="og:title"]')
      if (ogTitle) {
        ogTitle.setAttribute(
          "content",
          location
            ? `Golden Hour Times in ${location.city}, ${location.country} - Photography Calculator`
            : "Golden Hour Calculator - Perfect Photography Lighting Times"
        )
      }

      // Update Open Graph description
      const ogDescription = document.querySelector('meta[property="og:description"]')
      if (ogDescription) {
        ogDescription.setAttribute(
          "content",
          location
            ? `Calculate golden hour and blue hour times for ${location.city}, ${location.country}. Professional photography tool with interactive maps and sun position tracking.`
            : "Calculate golden hour and blue hour times for any location worldwide. Professional photography tool with interactive maps and sun position tracking."
        )
      }

      // Update Twitter title
      const twitterTitle = document.querySelector('meta[name="twitter:title"]')
      if (twitterTitle) {
        twitterTitle.setAttribute(
          "content",
          location
            ? `Golden Hour Calculator - ${location.city}, ${location.country}`
            : "Golden Hour Calculator - Perfect Photography Lighting Times"
        )
      }

      // Update Twitter description
      const twitterDescription = document.querySelector('meta[name="twitter:description"]')
      if (twitterDescription) {
        twitterDescription.setAttribute(
          "content",
          location
            ? `Calculate golden hour and blue hour times for ${location.city}, ${location.country}. Professional photography tool with interactive maps.`
            : "Calculate golden hour and blue hour times for any location worldwide. Professional photography tool with interactive maps."
        )
      }

      // Update structured data
      updateStructuredData(location)
    }
  }, [location])

  const updateStructuredData = (location?: LocationData) => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]')
    if (existingScript) {
      existingScript.remove()
    }

    // Create new structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Golden Hour Calculator",
      description: location
        ? `Calculate golden hour and blue hour times for ${location.city}, ${location.country}. Professional photography tool with interactive maps, sun position tracking, and real-time lighting predictions.`
        : "Calculate golden hour and blue hour times for any location worldwide. Professional photography tool with interactive maps, sun position tracking, and real-time lighting predictions.",
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
    }

    // Add location-specific structured data if available
    if (location) {
      Object.assign(structuredData, {
        location: {
          "@type": "Place",
          name: `${location.city}, ${location.country}`,
          address: {
            "@type": "PostalAddress",
            addressLocality: location.city,
            addressCountry: location.country,
            addressRegion: location.state,
          },
        },
      })
    }

    // Create and append script tag
    const script = document.createElement("script")
    script.type = "application/ld+json"
    script.text = JSON.stringify(structuredData)
    document.head.appendChild(script)
  }

  // This component handles SEO updates via useEffect
  // No JSX return needed as it manipulates the document head directly
  return null
}
