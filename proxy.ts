import { type NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'

export async function proxy(request: NextRequest) {
  const authResponse = await auth0.middleware(request)
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/auth')) return authResponse
  if (pathname !== '/dashboard' && !pathname.startsWith('/dashboard/') && pathname !== '/profile' && !pathname.startsWith('/profile/')) {
    return authResponse
  }

  const session = await auth0.getSession(request)
  if (!session) {
    return NextResponse.redirect(new URL(`/auth/login?returnTo=${encodeURIComponent(pathname)}`, request.url))
  }

  return authResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
