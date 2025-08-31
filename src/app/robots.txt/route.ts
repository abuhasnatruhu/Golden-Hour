import { NextResponse } from 'next/server'
import { intelligentURLManager } from '@/lib/intelligent-url-manager'

export async function GET() {
  try {
    const robotsTxt = intelligentURLManager.generateRobotsTxt()
    
    return new NextResponse(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400'
      }
    })
  } catch (error) {
    console.error('Robots.txt generation error:', error)
    return new NextResponse('User-agent: *\nAllow: /', {
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 86400 // Revalidate daily
