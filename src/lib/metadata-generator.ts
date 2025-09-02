import { Metadata } from 'next';
import { seoOptimizer, type LocationSEOData } from './seo-optimizer';
import type { LocationData } from './location-service';

export interface MetadataParams {
  location?: LocationData;
  date?: Date;
  pathname?: string;
  searchParams?: Record<string, string | string[]>;
}

function convertLocationData(location: LocationData): LocationSEOData {
  return {
    city: location.city,
    country: location.country,
    state: location.state,
    region: location.region,
    timezone: location.timezone,
    coordinates: {
      lat: location.lat,
      lon: location.lon
    }
  };
}

export function generateDynamicMetadata(params: MetadataParams = {}): Metadata {
  const { location, date = new Date(), pathname = '/', searchParams = {} } = params;
  
  // Convert LocationData to LocationSEOData
  const locationSEOData = location ? convertLocationData(location) : null;
  
  // Generate location-based SEO data
  const locationSEO = locationSEOData ? seoOptimizer.generateLocationSEO(locationSEOData, date) : null;
  
  // Base metadata
  const baseTitle = "Golden Hour Calculator 2025 | Best Free Photography Lighting Tool & Sun Tracker";
  const baseDescription = "Professional golden hour calculator with real-time weather integration. Get precise sunrise, sunset & blue hour times worldwide. Free photography planning tool with interactive maps, sun position tracking, and authentic location-based inspiration.";
  
  // Dynamic title and description
  const title = locationSEO?.title || baseTitle;
  const description = locationSEO?.description || baseDescription;
  
  // Generate canonical URL (simplified for now)
  const canonicalUrl = pathname === '/' ? '/' : pathname;
  
  // Generate meta tags HTML string
  const metaTagsHTML = locationSEO ? seoOptimizer.generateMetaTags(locationSEO) : '';
  
  return {
    title,
    description,
    keywords: locationSEO?.keywords || [],
    authors: [{ name: "Golden Hour Calculator Team" }],
    creator: "Golden Hour Calculator",
    publisher: "Golden Hour Calculator",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL("https://goldenhour-calculator.vercel.app"),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: locationSEO?.ogTitle || title,
      description: locationSEO?.ogDescription || description,
      url: canonicalUrl,
      siteName: "Golden Hour Calculator",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: locationSEO ? `Golden Hour Times for ${location?.city}, ${location?.country}` : "Professional Golden Hour Calculator - Photography Planning Tool",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: locationSEO?.twitterTitle || title,
      description: locationSEO?.twitterDescription || description,
      images: ["/og-image.jpg"],
      creator: "@goldenhourcalc",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    other: {
      // Add location-specific meta tags
      ...(location && {
        'geo.region': location.country,
        'geo.placename': `${location.city}, ${location.region}`,
        'geo.position': `${location.lat};${location.lon}`,
        'ICBM': `${location.lat}, ${location.lon}`,
      }),
      // Add photography-specific meta tags
      'photography.tool': 'golden-hour-calculator',
      'photography.type': 'lighting-calculator',
      'app.category': 'photography',
    },
  };
}

export function generateStructuredDataScript(location?: LocationData, date: Date = new Date()): string {
  if (!location) return '';
  
  const locationSEOData = convertLocationData(location);
  const breadcrumbData = seoOptimizer.generateBreadcrumbStructuredData(locationSEOData);
  
  // Create basic structured data for the location
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Golden Hour Calculator",
    "description": `Golden hour calculator for ${location.city}, ${location.country}`,
    "url": "https://goldenhour-calculator.vercel.app",
    "applicationCategory": "PhotographyApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": location.lat,
      "longitude": location.lon
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": location.city,
      "addressRegion": location.region || location.state,
      "addressCountry": location.country
    }
  };
  
  return `<script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>`;
}

export function generateBreadcrumbScript(pathname: string, location?: LocationData): string {
  if (!location) return '';
  
  const locationSEOData = convertLocationData(location);
  const breadcrumbData = seoOptimizer.generateBreadcrumbStructuredData(locationSEOData);
  return `<script type="application/ld+json">${JSON.stringify(breadcrumbData, null, 2)}</script>`;
}
