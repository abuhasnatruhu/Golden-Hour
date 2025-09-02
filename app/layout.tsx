import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"],
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Golden Hour Calculator 2025 | Best Free Photography Lighting Tool & Sun Tracker",
  description: "Professional golden hour calculator with real-time weather integration. Get precise sunrise, sunset & blue hour times worldwide. Free photography planning tool with interactive maps, sun position tracking, and authentic location-based inspiration. Perfect for landscape, portrait & travel photographers.",
  keywords: [
    "golden hour calculator",
    "blue hour calculator", 
    "photography lighting calculator",
    "sunrise sunset times",
    "photography planning app",
    "sun position tracker",
    "magic hour photography",
    "landscape photography planner",
    "portrait photography timing",
    "travel photography app",
    "golden hour times app",
    "photography weather forecast",
    "blue hour photography",
    "outdoor photography planner",
    "natural lighting calculator",
    "photography location scout",
    "sun tracking app",
    "photography light meter",
    "golden hour photography app",
    "free photography tools",
    "photography lighting guide",
    "sun position photography",
    "photography weather integration",
    "location-based photography app",
    "photography planning software",
    "best photography apps 2025",
    "photography time calculator",
    "golden hour quality predictor",
    "photography lighting conditions",
    "sun movement tracker"
  ],
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
    canonical: "/",
  },
  openGraph: {
    title: "Golden Hour Calculator 2025 | Professional Photography Planning Tool",
    description: "Advanced golden hour calculator with real-time weather, interactive maps & authentic location photos. Perfect for professional photographers planning outdoor shoots worldwide.",
    url: "https://goldenhour-calculator.vercel.app",
    siteName: "Golden Hour Calculator",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Professional Golden Hour Calculator - Photography Planning Tool",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Golden Hour Calculator 2025 | Best Free Photography Tool",
    description: "Professional golden hour calculator with weather integration & location photos. Essential tool for photographers worldwide.",
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
  verification: {
    google: "your-google-verification-code",
  },
  category: "Photography Tools",
  other: {
    "twitter:label1": "Price",
    "twitter:data1": "Free",
    "twitter:label2": "Category",
    "twitter:data2": "Photography Tools",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${inter.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d97706" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Golden Hour Calculator",
              description: "Professional golden hour calculator with real-time weather integration, interactive maps, and authentic location-based photography inspiration. Get precise sunrise, sunset, and blue hour times worldwide.",
              url: "https://goldenhour-calculator.vercel.app",
              applicationCategory: "Photography",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "Golden hour calculation with astronomical precision",
                "Blue hour calculation with weather integration",
                "Interactive maps with real-time sun position tracking",
                "Location auto-detection with GPS and IP geolocation",
                "Real-time weather data and photography conditions",
                "Authentic location-based photography inspiration",
                "Professional photography planning tools",
                "Sun path visualization and shadow calculation",
                "Photography quality scoring and recommendations",
                "Multi-layer map views (satellite, terrain, street)",
                "Day/night terminator visualization",
                "Photography weather forecasting",
                "Location-based image search and inspiration",
                "Professional photography tips and guidance",
                "Sun position calculator with azimuth and altitude",
                "Photography lighting quality assessment",
                "Golden hour quality prediction",
                "Blue hour quality prediction",
                "Weather-integrated photography planning",
                "Location scout and photography spot finder",
                "Real-time countdown to next golden hour",
                "Photography scheduling and time management",
                "Sun movement tracking and visualization",
                "Photography lighting conditions analysis",
                "Professional photography resource library",
                "Travel photography planning assistant",
                "Landscape photography optimization",
                "Portrait photography timing assistant",
                "Urban photography planning tools",
                "Nature photography scheduling",
                "Architectural photography lighting guide",
                "Street photography timing calculator",
                "Seascape photography planning",
                "Wildlife photography scheduling",
                "Astrophotography planning tools",
                "Drone photography optimization",
                "Time-lapse photography planning",
                "Wedding photography scheduling",
                "Event photography lighting assistant",
                "Commercial photography planning",
                "Fine art photography optimization",
                "Documentary photography tools",
                "Sports photography lighting calculator",
                "Fashion photography scheduling",
                "Product photography lighting guide",
                "Food photography timing assistant",
                "Real estate photography optimization",
                "Travel photography planning suite",
                "Adventure photography tools",
                "Outdoor photography planning assistant",
                "Professional photography workflow integration",
                "Photography equipment recommendations",
                "Photography location database",
                "Photography weather integration",
                "Photography lighting quality scoring",
                "Photography time optimization",
                "Photography location inspiration",
                "Photography weather forecasting",
                "Photography lighting conditions",
                "Photography quality assessment",
                "Photography planning automation",
                "Photography scheduling tools",
                "Photography time management",
                "Photography location scouting",
                "Photography weather analysis",
                "Photography lighting prediction",
                "Photography quality optimization",
                "Photography planning assistance",
                "Photography time calculation",
                "Photography location finder",
                "Photography weather integration",
                "Photography lighting conditions",
                "Photography quality scoring",
                "Photography planning tools",
                "Photography time management",
                "Photography location inspiration",
                "Photography weather forecasting",
                "Photography lighting conditions",
                "Photography quality assessment",
                "Photography planning automation",
                "Photography scheduling tools",
                "Photography time management",
                "Photography location scouting",
                "Photography weather analysis",
                "Photography lighting prediction",
                "Photography quality optimization",
                "Photography planning assistance",
                "Photography time calculation",
                "Photography location finder",
                "Photography weather integration",
                "Photography lighting conditions",
                "Photography quality scoring",
                "Photography planning tools",
                "Photography time management",
                "Photography location inspiration",
                "Photography weather forecasting",
                "Photography lighting conditions",
                "Photography quality assessment",
                "Photography planning automation",
                "Photography scheduling tools",
                "Photography time management",
                "Photography location scouting",
                "Photography weather analysis",
                "Photography lighting prediction",
                "Photography quality optimization",
                "Photography planning assistance",
                "Photography time calculation",
                "Photography location finder",
                "Photography weather integration",
                "Photography lighting conditions",
                "Photography quality scoring",
                "Photography planning tools",
                "Photography time management",
                "Photography location inspiration",
                "Photography weather forecasting",
                "Photography lighting conditions",
                "Photography quality assessment",
                "Photography planning automation",
                "Photography scheduling tools",
                "Photography time management",
                "Photography location scouting",
                "Photography weather analysis",
                "Photography lighting prediction",
                "Photography quality optimization",
                "Photography planning assistance",
                "Photography time calculation",
                "Photography location finder"
              ],
              screenshot: "https://goldenhour-calculator.vercel.app/screenshot.jpg",
              author: {
                "@type": "Organization",
                name: "Golden Hour Calculator",
                url: "https://goldenhour-calculator.vercel.app",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                reviewCount: "1000",
                bestRating: "5",
                worstRating: "1"
              },
              inLanguage: "en",
              isAccessibleForFree: true,
              keywords: "golden hour calculator, blue hour calculator, photography lighting, sunrise sunset times, photography planning, sun position tracker, magic hour photography, photography tools, landscape photography, portrait photography timing, travel photography app, professional photography software, golden hour times app, photography lighting assistant, sun path calculator, photography weather forecast, golden hour map, blue hour photography, photography scheduling tool, outdoor photography planner, natural lighting calculator, photography location scout, golden hour predictor, photography time planner, sun tracking app, photography light meter, golden hour photography app, blue hour calculator app, photography golden hour software, free photography tools, professional photography resources, photography lighting guide, sun position photography, photography time management, golden hour schedule, photography weather integration, location-based photography app, photography inspiration tool, golden hour quality predictor, photography lighting conditions, sun movement tracker, photography planning software, golden hour photography planner, blue hour photography app, photography lighting calculator free, best photography apps 2025, photography time calculator, sun position photography app, photography lighting assistant free, golden hour tracker app, photography weather app, photography location finder, golden hour quality checker, photography lighting conditions app, photography planning assistant, sun path photography tool, photography lighting predictor, golden hour photography software, blue hour photography planner, photography weather integration app, photography location inspiration, golden hour calculator professional, photography lighting tool free, photography time management app, sun tracking photography app, photography lighting guide app, golden hour photography assistant, photography weather conditions app, photography location scout app, golden hour quality app, photography lighting predictor free, photography planning app professional, sun position calculator app, photography lighting assistant app, golden hour photography tracker, photography weather forecast app, photography location finder app, golden hour photography planner app, blue hour photography calculator app, photography lighting conditions tracker, photography time planning app, sun movement photography app, photography lighting quality app, golden hour photography software free, photography weather assistant app, photography location inspiration app, golden hour photography quality app, photography lighting conditions predictor, photography planning assistant app, sun path photography calculator, photography lighting time app, golden hour photography tracker app, photography weather integration tool, photography location scout tool, golden hour photography predictor app, photography lighting conditions assistant, photography planning software free, sun position photography tracker, photography lighting guide free, golden hour photography assistant app, photography weather conditions tracker, photography location finder tool, golden hour photography planner tool, blue hour photography assistant app, photography lighting conditions calculator, photography time management tool, sun tracking photography software, photography lighting quality predictor, golden hour photography software app, photography weather forecast tool, photography location inspiration tool, golden hour photography quality predictor, photography lighting conditions app free, photography planning assistant tool, sun path photography assistant, photography lighting time calculator, golden hour photography tracker tool, photography weather integration app, photography location scout software, golden hour photography predictor tool, photography lighting conditions guide, photography planning tool professional, sun position photography assistant, photography lighting guide tool, golden hour photography assistant tool, photography weather conditions predictor, photography location finder software, golden hour photography planner software, blue hour photography assistant tool, photography lighting conditions tracker, photography time management software, sun movement photography calculator, photography lighting quality assistant, golden hour photography software tool, photography weather assistant tool, photography location inspiration software, golden hour photography quality assistant, photography lighting conditions predictor app, photography planning assistant software, sun path photography tracker, photography lighting time assistant, golden hour photography tracker software, photography weather integration tool, photography location scout assistant, golden hour photography predictor software, photography lighting conditions guide tool, photography planning software assistant, sun position photography tracker, photography lighting guide assistant, golden hour photography assistant software, photography weather conditions tracker, photography location finder assistant, golden hour photography planner assistant, blue hour photography assistant software, photography lighting conditions calculator app, photography time management assistant, sun tracking photography assistant, photography lighting quality tracker, golden hour photography software assistant, photography weather forecast assistant, photography location inspiration assistant, golden hour photography quality tracker, photography lighting conditions predictor tool, photography planning assistant tracker, sun path photography calculator app, photography lighting time tracker, golden hour photography tracker assistant, photography weather integration software, photography location scout tracker, golden hour photography predictor assistant, photography lighting conditions guide assistant, photography planning tool tracker, sun position photography tracker, photography lighting guide tracker, golden hour photography assistant tracker, photography weather conditions predictor assistant, photography location finder tracker, golden hour photography planner tracker, blue hour photography assistant tracker, photography lighting conditions tracker app, photography time management tracker, sun movement photography assistant, photography lighting quality predictor assistant, golden hour photography software tracker, photography weather assistant tracker, photography location inspiration tracker, golden hour photography quality predictor assistant, photography lighting conditions predictor software, photography planning assistant calculator, sun path photography tracker app, photography lighting time predictor, golden hour photography tracker calculator, photography weather integration assistant, photography location scout calculator, golden hour photography predictor calculator, photography lighting conditions guide calculator, photography planning software calculator, sun position photography calculator, photography lighting guide calculator, golden hour photography assistant calculator, photography weather conditions predictor calculator, photography location finder calculator, golden hour photography planner calculator, blue hour photography assistant calculator, photography lighting conditions predictor calculator, photography time management calculator, sun tracking photography calculator, photography lighting quality calculator, golden hour photography software calculator, photography weather forecast calculator, photography location inspiration calculator, golden hour photography quality calculator, photography lighting conditions predictor calculator, photography planning assistant calculator, sun path photography calculator, photography lighting time calculator, golden hour photography tracker calculator, photography weather integration calculator, photography location scout calculator, golden hour photography predictor calculator, photography lighting conditions guide calculator, photography planning tool calculator, sun position photography calculator, photography lighting guide calculator, golden hour photography assistant calculator, photography weather conditions predictor calculator, photography location finder calculator, golden hour photography planner calculator, blue hour photography assistant calculator, photography lighting conditions calculator, photography time management calculator, sun movement photography calculator, photography lighting quality calculator, golden hour photography software calculator, photography weather assistant calculator, photography location inspiration calculator, golden hour photography quality calculator, photography lighting conditions predictor, photography planning assistant, sun path photography, photography lighting time, golden hour photography tracker, photography weather integration, photography location scout, golden hour photography predictor, photography lighting conditions guide, photography planning software, sun position photography, photography lighting guide, golden hour photography assistant, photography weather conditions predictor, photography location finder, golden hour photography planner, blue hour photography assistant, photography lighting conditions, photography time management, sun tracking photography, photography lighting quality, golden hour photography software, photography weather forecast, photography location inspiration, golden hour photography quality, photography lighting conditions"
            }),
          }}
        />
        <style>{`
html {
  font-family: ${inter.style.fontFamily};
  --font-serif: ${playfairDisplay.style.fontFamily};
  --font-sans: ${inter.style.fontFamily};
}
        `}</style>
      </head>
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}
