import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Obsługa QR kodów - redirect do kamery
  if (pathname === '/qr' || pathname === '/scan') {
    const url = request.nextUrl.clone()
    url.pathname = '/camera'
    return NextResponse.redirect(url)
  }

  // Obsługa starych URLi z eventId/tableId
  if (pathname.includes('/event/')) {
    const url = request.nextUrl.clone()
    url.pathname = '/camera'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/qr', '/scan', '/event/:path*']
}
