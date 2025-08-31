"use client"

import ShareButton, { QuickCopyButton } from "@/components/share-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sun, MapPin, Clock } from "lucide-react"

export default function ShareDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center text-white py-8">
          <h1 className="text-4xl font-bold mb-4">Social Media Sharing Demo</h1>
          <p className="text-xl opacity-90">
            Test the sharing functionality for Golden Hour locations
          </p>
        </div>

        {/* Demo Golden Hour Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sun className="w-8 h-8 text-yellow-300" />
              <div>
                <CardTitle className="text-2xl">Golden Hour Times in Paris, France</CardTitle>
                <CardDescription className="text-white/80">
                  Perfect photography lighting conditions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location Info */}
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-yellow-300" />
              <span className="font-medium">Paris, France</span>
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-100">
                Evening Golden Hour
              </Badge>
            </div>

            {/* Time Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-300" />
                <div>
                  <div className="text-sm opacity-80">Golden Hour Start</div>
                  <div className="font-bold text-lg">6:45 PM</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-pink-300" />
                <div>
                  <div className="text-sm opacity-80">Golden Hour End</div>
                  <div className="font-bold text-lg">7:30 PM</div>
                </div>
              </div>
            </div>

            {/* Sharing Options */}
            <div className="border-t border-white/20 pt-6">
              <h3 className="text-lg font-semibold mb-4">Share this location:</h3>
              <div className="flex flex-wrap gap-3">
                <ShareButton 
                  title="Golden Hour Times in Paris, France"
                  description="Perfect golden hour photography times for Paris. Evening Golden Hour starts at 6:45 PM and ends at 7:30 PM."
                  variant="outline"
                  size="default"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                />
                <QuickCopyButton 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                  size="default"
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h4 className="font-semibold mb-2">How to share:</h4>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• Click "Share" to see all sharing options</li>
                <li>• Use "Copy Link" to copy the URL to clipboard</li>
                <li>• Share directly to Facebook, Twitter, WhatsApp, or Email</li>
                <li>• On mobile devices, use native sharing when available</li>
                <li>• Each shared link includes rich preview with golden hour times</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle>Rich Social Media Previews</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Open Graph meta tags for Facebook</li>
                <li>• Twitter Card support for rich previews</li>
                <li>• Dynamic titles with location and times</li>
                <li>• SEO-optimized descriptions</li>
                <li>• Automatic image generation for previews</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle>Multiple Sharing Options</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• One-click copy to clipboard</li>
                <li>• Direct Facebook sharing</li>
                <li>• Twitter/X integration</li>
                <li>• WhatsApp quick share</li>
                <li>• Email with formatted content</li>
                <li>• Native mobile sharing API</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Back to Home */}
        <div className="text-center py-6">
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors backdrop-blur-sm border border-white/20"
          >
            ← Back to Golden Hour Calculator
          </a>
        </div>
      </div>
    </div>
  )
}
