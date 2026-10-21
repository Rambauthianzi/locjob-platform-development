import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function safeNext(value: string | null) {
  return value && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\') ? value : '/dashboard'
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const destination = safeNext(url.searchParams.get('next'))
  const code = url.searchParams.get('code')
  if (!code) return NextResponse.redirect(new URL('/login?error=link_expired', url.origin))
  const { error } = await (await createClient()).auth.exchangeCodeForSession(code)
  if (error) return NextResponse.redirect(new URL('/login?error=link_expired', url.origin))
  return NextResponse.redirect(new URL(destination, url.origin))
}
