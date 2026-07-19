import { NextResponse } from 'next/server'
import { auth } from '@/auth'

// Pages that require an active session
const protectedPaths = ['/', '/customers', '/vehicles', '/invoices']

export default auth((req) => {
  const { pathname } = req.nextUrl

  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }
})

// Next.js 16 renamed the `middleware` file convention to `proxy`.
// Run on all page routes, excluding API routes, static assets, and the auth pages themselves.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)'],
}
