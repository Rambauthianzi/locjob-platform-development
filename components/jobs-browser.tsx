'use client'

import Link from 'next/link'
import { Heart, MapPin, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formControlClass, formSelectClass, primaryButtonClass } from '@/lib/form-styles'
import { postedLabel, workTypes, type Job } from '@/lib/jobs'
import { createClient } from '@/lib/supabase/client'

const PAGE_SIZE = 12

type Filters = { q: string; location: string; type: string }

type JobsBrowserProps = {
  initialJobs: Job[]
  initialFilters: Filters
  total: number
  page: number
  error?: string
}

export function JobsBrowser({ initialJobs, initialFilters, total, page, error }: JobsBrowserProps) {
  const [saved, setSaved] = useState<string[]>([])
  const [role, setRole] = useState<'guest' | 'employee' | 'employer'>('guest')
  const [message, setMessage] = useState('')

  // Load which jobs this job seeker already saved, so the hearts are correct after a refresh.
  useEffect(() => {
    let active = true
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
      if (!active) return
      if (profile?.role === 'employer') return setRole('employer')
      setRole('employee')
      const { data } = await supabase.from('saved_jobs').select('job_id').eq('employee_id', user.id)
      if (active) setSaved((data ?? []).map((row) => row.job_id))
    }
    load()
    return () => {
      active = false
    }
  }, [])

  async function toggle(jobId: string) {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return setMessage('Sign in as a job seeker to save jobs.')

    const exists = saved.includes(jobId)
    const result = exists
      ? await supabase.from('saved_jobs').delete().match({ job_id: jobId, employee_id: user.id })
      : await supabase.from('saved_jobs').insert({ job_id: jobId, employee_id: user.id })

    if (result.error) return setMessage('Could not update saved jobs.')
    setMessage('')
    setSaved((current) => (exists ? current.filter((id) => id !== jobId) : [...current, jobId]))
  }

  // Keep the current filters when moving between pages.
  const baseParams = new URLSearchParams()
  if (initialFilters.q) baseParams.set('q', initialFilters.q)
  if (initialFilters.location) baseParams.set('location', initialFilters.location)
  if (initialFilters.type) baseParams.set('type', initialFilters.type)
  const pageLink = (target: number) => {
    const params = new URLSearchParams(baseParams)
    params.set('page', String(target))
    return `/jobs?${params}`
  }

  const from = total ? (page - 1) * PAGE_SIZE + 1 : 0
  const to = Math.min(page * PAGE_SIZE, total)
  const hasFilters = Boolean(initialFilters.q || initialFilters.location || initialFilters.type)

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <form
        method="get"
        className="grid gap-3 rounded-2xl border border-[#dce6ee] bg-white p-3 md:grid-cols-[1.3fr_1fr_220px_auto]"
      >
        <label className="flex items-center gap-3">
          <Search className="size-5 shrink-0 text-[#7b90a3]" aria-hidden="true" />
          <span className="sr-only">Keyword</span>
          <input
            name="q"
            defaultValue={initialFilters.q}
            className={formControlClass}
            placeholder="Job title, skill or category"
          />
        </label>
        <label className="flex items-center gap-3">
          <MapPin className="size-5 shrink-0 text-[#7b90a3]" aria-hidden="true" />
          <span className="sr-only">Location</span>
          <input
            name="location"
            defaultValue={initialFilters.location}
            className={formControlClass}
            placeholder="City or province"
          />
        </label>
        <label className="sr-only" htmlFor="work-type">
          Work type
        </label>
        <select
          id="work-type"
          name="type"
          defaultValue={initialFilters.type || 'All types'}
          className={formSelectClass}
        >
          {workTypes.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <button className={primaryButtonClass}>Search</button>
      </form>

      {hasFilters && (
        <Link href="/jobs" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[#168057]">
          Clear filters
        </Link>
      )}
      {message && (
        <p role="status" className="mt-4 text-sm font-semibold text-[#168057]">
          {message}{' '}
          <Link href="/login?next=/jobs" className="underline">
            Sign in
          </Link>
        </p>
      )}
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <p className="mt-6 text-sm text-[#52677a]">
        Showing {from} to {to} of {total} jobs
      </p>

      {initialJobs.length ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {initialJobs.map((job) => {
            const isSaved = saved.includes(job.id)
            return (
              <article key={job.id} className="rounded-2xl border border-[#dce6ee] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase text-[#20a36a]">{job.category}</p>
                    <h2 className="mt-2 text-xl font-bold text-[#0d3b66]">
                      <Link href={`/jobs/${job.id}`} className="hover:underline">
                        {job.title}
                      </Link>
                    </h2>
                    <p className="mt-1 text-sm text-[#71879a]">{job.company}</p>
                  </div>
                  {role !== 'employer' && (
                    <button
                      onClick={() => toggle(job.id)}
                      aria-label={isSaved ? 'Remove saved job' : 'Save job'}
                      aria-pressed={isSaved}
                      className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-[#20a36a]"
                    >
                      <Heart className={isSaved ? 'fill-current' : ''} aria-hidden="true" />
                    </button>
                  )}
                </div>
                <p className="mt-4 text-sm text-[#52677a]">
                  {job.location} · {job.work_type}
                </p>
                <div className="mt-4 flex items-end justify-between gap-2">
                  <p className="font-bold text-[#0d3b66]">{job.pay}</p>
                  <p className="text-xs text-[#8da0ae]">{postedLabel(job.created_at)}</p>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-[#dce6ee] bg-white p-8 text-[#52677a]">
          No opportunities match your search. Try different words, or clear the filters.
        </p>
      )}

      <div className="mt-8 flex gap-3">
        {page > 1 && (
          <Link
            href={pageLink(page - 1)}
            className="inline-flex min-h-11 items-center rounded-xl border border-[#c9d6e2] bg-white px-5 font-semibold text-[#0d3b66]"
          >
            Previous
          </Link>
        )}
        {to < total && (
          <Link
            href={pageLink(page + 1)}
            className="inline-flex min-h-11 items-center rounded-xl border border-[#c9d6e2] bg-white px-5 font-semibold text-[#0d3b66]"
          >
            Next
          </Link>
        )}
      </div>
    </section>
  )
}
