import { NextRequest, NextResponse } from 'next/server'
import { simpleURLManager } from './lib/simple-url-manager'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') ||
    pathname.startsWith('/admin/')
  ) {
    return NextResponse.next()
  }

  // Check for static redirects
  const redirect = simpleURLManager.checkRedirect(pathname)
  if (redirect) {
    return NextResponse.redirect(
      new URL(redirect.to, request.url),
      redirect.status
    )
  }

  // Handle legacy URL patterns
  if (pathname.startsWith('/gh/') || pathname.startsWith('/calculator/')) {
    const newPath = pathname.replace(/^\/(gh|calculator)/, '/golden-hour')
    return NextResponse.redirect(new URL(newPath, request.url), 301)
  }

  // Normalize URLs (remove trailing slashes except for root)
  if (pathname !== '/' && pathname.endsWith('/')) {
    const normalizedPath = pathname.slice(0, -1)
    return NextResponse.redirect(new URL(normalizedPath, request.url), 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
