'use client'

import Link from 'next/link'
import { BriefcaseBusiness, Menu, X } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Viewer = { id: string; role: 'employee' | 'employer' } | null

const publicLinks = [
  ['Home', '/'],
  ['Browse jobs', '/jobs'],
  ['How it works', '/#how-it-works'],
  ['About', '/about'],
] as const

const employerLinks = [
  ['Employer dashboard', '/employer/dashboard'],
  ['Post a job', '/employer/jobs/new'],
  ['Profile', '/profile'],
] as const

const employeeLinks = [
  ['Dashboard', '/dashboard'],
  ['Profile', '/profile'],
] as const

export function SiteHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [viewer, setViewer] = useState<Viewer>(null)

  // Read the session locally (no network), then fetch the role once.
  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!active) return
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
        if (!active) return
        setViewer({ id: session.user.id, role: data?.role === 'employer' ? 'employer' : 'employee' })
      } else {
        setViewer(null)
      }
      setLoading(false)
    }

    load()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event !== 'INITIAL_SESSION') load()
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  // Close the mobile menu on navigation and on Escape.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    function close(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

  async function signOut() {
    await createClient().auth.signOut()
    setViewer(null)
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  const privateLinks: ReadonlyArray<readonly [string, string]> =
    viewer?.role === 'employer' ? employerLinks : employeeLinks

  const desktopLink = 'inline-flex min-h-11 items-center font-semibold text-[#0d3b66] hover:text-[#20a36a]'
  const mobileLink = 'flex min-h-12 items-center font-semibold text-[#0d3b66]'

  return (
    <header className="sticky top-0 z-40 border-b border-[#dce6ee] bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-2 text-xl font-bold text-[#0d3b66]">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#0d3b66] text-white">
            <BriefcaseBusiness className="size-5" aria-hidden="true" />
          </span>
          Loc<span className="text-[#20a36a]">Job</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 text-sm font-semibold text-[#52677a] lg:flex">
          {publicLinks.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="inline-flex min-h-11 items-center transition hover:text-[#20a36a]"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          {loading ? (
            <span className="h-10 w-32 animate-pulse rounded-lg bg-[#eef2f5]" />
          ) : viewer ? (
            <>
              {privateLinks.map(([label, href]) => (
                <Link key={href} href={href} className={desktopLink}>
                  {label}
                </Link>
              ))}
              <button onClick={signOut} className={desktopLink}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={desktopLink}>
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex min-h-11 items-center rounded-xl bg-[#0d3b66] px-4 font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[.98]"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <nav aria-label="Mobile" className="animate-fade-up border-t border-[#dce6ee] bg-white px-4 py-3 lg:hidden">
          {publicLinks.map(([label, href]) => (
            <Link key={href} href={href} className="flex min-h-12 items-center font-semibold text-[#52677a]">
              {label}
            </Link>
          ))}
          <div className="mt-2 border-t border-[#edf1f4] pt-2">
            {loading ? (
              <div className="h-12 animate-pulse rounded bg-[#eef2f5]" />
            ) : viewer ? (
              <>
                {privateLinks.map(([label, href]) => (
                  <Link key={href} href={href} className={mobileLink}>
                    {label}
                  </Link>
                ))}
                <button onClick={signOut} className={`${mobileLink} w-full`}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={mobileLink}>
                  Sign in
                </Link>
                <Link href="/signup" className={mobileLink}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
