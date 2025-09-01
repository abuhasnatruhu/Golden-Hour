"use client"

import Image from "next/image"
import Link from "next/link"

export function SiteHeader() {
  return (
    <header className="w-full bg-white/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="text-sm font-semibold text-blue-600 uppercase tracking-wide hover:text-blue-700 transition-colors"
            >
              Magic / Golden Hour Calculator
            </Link>
            <span className="text-sm text-muted-foreground">by</span>
            <Link 
              href="https://www.colorexpertsbd.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <Image
                  src="/color-experts-logo-new.png"
                  alt="Color Experts Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Color Experts International Inc.
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
