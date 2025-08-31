import { NextRequest, NextResponse } from 'next/server'
import { simpleURLManager } from '@/lib/simple-url-manager'

// Simple in-memory analytics (resets on server restart)
const analytics = {
  pageViews: new Map<string, number>(),
  totalViews: 0,
  lastReset: new Date()
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'dashboard-data'

  try {
    switch (action) {
      case 'dashboard-data':
        return getDashboardData()
      
      case 'locations':
        return getLocationsData()
      
      case 'sitemap':
        return getSitemapData()
      
      case 'stats':
        return getStatsData()
      
      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, url } = body

    if (action === 'track-view' && url) {
      // Track page view
      const currentViews = analytics.pageViews.get(url) || 0
      analytics.pageViews.set(url, currentViews + 1)
      analytics.totalViews++
      
      return NextResponse.json({ success: true, views: currentViews + 1 })
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Analytics POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getDashboardData() {
  const locations = simpleURLManager.getAllLocations()
  const stats = simpleURLManager.getStats()
  
  // Generate mock data for demonstration
  const dashboardData = {
    summary: {
      totalUrls: locations.length,
      totalViews: analytics.totalViews || 1250,
      avgSeoScore: 85,
      topLocation: locations[0]?.name || 'New York City'
    },
    topPerforming: locations.slice(0, 5).map((location, index) => ({
      url: `/golden-hour/${location.urlSlug}`,
      views: Math.floor(Math.random() * 500) + 100,
      seoScore: Math.floor(Math.random() * 20) + 80,
      conversionRate: Math.random() * 0.1 + 0.02,
      keywords: location.keywords.slice(0, 3)
    })),
    underperforming: locations.slice(-3).map((location, index) => ({
      url: `/golden-hour/${location.urlSlug}`,
      views: Math.floor(Math.random() * 50) + 10,
      seoScore: Math.floor(Math.random() * 15) + 60,
      conversionRate: Math.random() * 0.05 + 0.01,
      keywords: location.keywords.slice(0, 3)
    })),
    locationPerformance: locations.map(location => ({
      location: location.name,
      totalViews: Math.floor(Math.random() * 300) + 50,
      avgSeoScore: Math.floor(Math.random() * 20) + 75,
      urlCount: 1,
      topKeywords: location.keywords.slice(0, 3)
    })),
    trends: {
      viewsGrowth: Math.random() * 0.3 + 0.1,
      seoImprovement: Math.random() * 0.2 + 0.05,
      conversionTrend: Math.random() * 0.15 + 0.02
    }
  }

  return NextResponse.json({ success: true, data: dashboardData })
}

function getLocationsData() {
  const locations = simpleURLManager.getAllLocations()
  
  const locationAnalytics = locations.map(location => ({
    location: location.name,
    coordinates: location.coordinates,
    totalViews: analytics.pageViews.get(`/golden-hour/${location.urlSlug}`) || Math.floor(Math.random() * 200) + 50,
    uniqueVisitors: Math.floor(Math.random() * 150) + 30,
    avgSeoScore: Math.floor(Math.random() * 20) + 75,
    topKeywords: location.keywords.slice(0, 5),
    urlCount: 1,
    avgConversionRate: Math.random() * 0.08 + 0.02,
    socialShares: Math.floor(Math.random() * 50) + 5,
    lastUpdated: new Date().toISOString()
  }))

  return NextResponse.json({ success: true, analytics: locationAnalytics })
}

function getSitemapData() {
  const sitemapEntries = simpleURLManager.generateSitemap()
  return NextResponse.json({ success: true, sitemap: sitemapEntries })
}

function getStatsData() {
  const stats = simpleURLManager.getStats()
  const enhancedStats = {
    ...stats,
    totalViews: analytics.totalViews,
    uniquePages: analytics.pageViews.size,
    avgViewsPerPage: analytics.pageViews.size > 0 ? analytics.totalViews / analytics.pageViews.size : 0,
    lastReset: analytics.lastReset.toISOString(),
    topPages: Array.from(analytics.pageViews.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([url, views]) => ({ url, views }))
  }

  return NextResponse.json({ success: true, stats: enhancedStats })
}
