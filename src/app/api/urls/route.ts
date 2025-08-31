import { NextRequest, NextResponse } from 'next/server'
import { intelligentURLManager } from '@/lib/intelligent-url-manager'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const format = searchParams.get('format') as 'seo' | 'coordinates' | 'both' || 'seo'
    const includeDate = searchParams.get('includeDate') === 'true'
    const includePopularOnly = searchParams.get('includePopularOnly') !== 'false'
    const limit = parseInt(searchParams.get('limit') || '50')

    switch (action) {
      case 'generate':
        const urls = intelligentURLManager.generatePopularLocationURLs({
          format,
          includeDate,
          includePopularOnly
        })
        
        return NextResponse.json({
          success: true,
          count: urls.length,
          urls: urls.slice(0, limit)
        })

      case 'sitemap':
        const sitemapEntries = intelligentURLManager.generateSitemap({
          format,
          includeDate,
          includePopularOnly
        })
        
        return NextResponse.json({
          success: true,
          count: sitemapEntries.length,
          entries: sitemapEntries
        })

      case 'xml-sitemap':
        const xmlSitemap = intelligentURLManager.generateXMLSitemap({
          format,
          includeDate,
          includePopularOnly
        })
        
        return new NextResponse(xmlSitemap, {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600'
          }
        })

      case 'analyze':
        const analyzeUrls = searchParams.get('urls')?.split(',') || []
        if (analyzeUrls.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'No URLs provided for analysis'
          }, { status: 400 })
        }
        
        const analytics = intelligentURLManager.analyzeURLs(analyzeUrls)
        
        return NextResponse.json({
          success: true,
          analytics
        })

      case 'redirects':
        const redirects = intelligentURLManager.generateRedirects()
        
        return NextResponse.json({
          success: true,
          count: redirects.length,
          redirects
        })

      case 'suggestions':
        const query = searchParams.get('query')
        if (!query) {
          return NextResponse.json({
            success: false,
            error: 'Query parameter is required for suggestions'
          }, { status: 400 })
        }
        
        const suggestions = intelligentURLManager.getLocationSuggestions(query, limit)
        
        return NextResponse.json({
          success: true,
          count: suggestions.length,
          suggestions
        })

      case 'robots':
        const robotsTxt = intelligentURLManager.generateRobotsTxt()
        
        return new NextResponse(robotsTxt, {
          headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=86400'
          }
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Available actions: generate, sitemap, xml-sitemap, analyze, redirects, suggestions, robots'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('URL API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, locations, options } = body

    switch (action) {
      case 'generate-custom':
        if (!locations || !Array.isArray(locations)) {
          return NextResponse.json({
            success: false,
            error: 'Locations array is required'
          }, { status: 400 })
        }
        
        const customUrls = intelligentURLManager.generatePopularLocationURLs({
          ...options,
          customLocations: locations,
          includePopularOnly: false
        })
        
        return NextResponse.json({
          success: true,
          count: customUrls.length,
          urls: customUrls
        })

      case 'bulk-analyze':
        if (!locations || !Array.isArray(locations)) {
          return NextResponse.json({
            success: false,
            error: 'Locations array is required'
          }, { status: 400 })
        }
        
        const bulkAnalytics = locations.map(location => {
          const url = intelligentURLManager.generateURL({
            lat: location.lat,
            lng: location.lng,
            locationName: location.name
          })
          return intelligentURLManager.analyzeURL(url)
        })
        
        return NextResponse.json({
          success: true,
          analytics: bulkAnalytics
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Available actions: generate-custom, bulk-analyze'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('URL API POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
