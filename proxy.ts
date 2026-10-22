import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => request.cookies.getAll(), setAll: (cookies) => cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)) },
  })
  const { data } = await supabase.auth.getClaims()
  const pathname = request.nextUrl.pathname
  const protectedRoute = pathname === '/dashboard' || pathname === '/profile' || pathname.startsWith('/employer')
  const authRoute = pathname === '/login' || pathname === '/signup'
  if ((protectedRoute && !data?.claims) || (authRoute && data?.claims)) {
    const destination = data?.claims ? '/dashboard' : '/login'
    const url = new URL(destination, request.url)
    if (!data?.claims) url.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(url)
  }
  return response
}

export const config = { matcher: ['/dashboard', '/profile', '/employer/:path*', '/login', '/signup'] }
