import { NextResponse } from 'next/server'
import { intelligentURLManager } from '@/lib/intelligent-url-manager'

export async function GET() {
  try {
    // Generate comprehensive sitemap with popular locations
    const xmlSitemap = intelligentURLManager.generateXMLSitemap({
      format: 'seo',
      includeDate: false,
      includePopularOnly: true
    })
    
    return new NextResponse(xmlSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour
