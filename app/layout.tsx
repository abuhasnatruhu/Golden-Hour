import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import Script from "next/script"
import "./globals.css"

export const metadata: Metadata = {
  title: "Golden Hour Calculator 2025 | Best Free Photography Lighting Tool",
  description:
    "Professional golden hour calculator with real-time weather integration. Get precise sunrise, sunset & blue hour times worldwide.",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["golden hour", "blue hour", "photography", "sunrise", "sunset", "lighting calculator"],
  authors: [{ name: "Golden Hour Team" }],
  openGraph: {
    title: "Golden Hour Calculator",
    description: "Calculate perfect photography lighting times",
    type: "website",
    locale: "en_US",
    url: "https://goldenhourcalculator.com",
    siteName: "Golden Hour Calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Golden Hour Calculator",
    description: "Calculate perfect photography lighting times",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Golden Hour" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}