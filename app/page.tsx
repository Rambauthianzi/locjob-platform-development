import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BriefcaseBusiness, Clock3, MapPin, ShieldCheck } from 'lucide-react'
import { createPublicClient } from '@/lib/supabase/public'
import { JOB_COLUMNS, mapJob, postedLabel, type Job, type JobRow } from '@/lib/jobs'

export const metadata: Metadata = { title: 'Local jobs and opportunities' }

// Public page: rebuilt at most once a minute instead of on every visit.
export const revalidate = 60

const popularSearches = ['Retail', 'Hospitality', 'Admin']

const steps = [
  { number: '01', title: 'Search locally', text: 'Browse real jobs near you by keyword, place and work type.' },
  { number: '02', title: 'Apply directly', text: 'Send a short cover note and your profile in one tap.' },
  { number: '03', title: 'Build experience', text: 'Track every application and grow your work history.' },
]

async function getLatestJobs(): Promise<Job[]> {
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('jobs')
      .select(JOB_COLUMNS)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(4)
    return ((data ?? []) as JobRow[]).map(mapJob)
  } catch {
    return []
  }
}

export default async function HomePage() {
  const jobs = await getLatestJobs()

  return (
    <main className="page-fade min-h-dvh bg-[#f7f9fb] text-[#102a43]">
      <section className="bg-[#eef6f3]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 lg:grid-cols-[1.1fr_.9fr] lg:py-20">
          <div>
            <p className="font-bold uppercase tracking-[.16em] text-[#20a36a]">
              Local opportunities. Real experience.
            </p>
            <h1 className="mt-4 max-w-2xl text-balance text-[clamp(2.25rem,7vw,4.5rem)] font-bold leading-[1.05] text-[#0d3b66]">
              Find work that fits your next step.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-7 text-[#52677a]">
              Discover local jobs, practical experience and opportunities that help you move forward.
            </p>

            <form
              action="/jobs"
              className="mt-8 grid gap-3 rounded-2xl bg-white p-3 shadow-lg sm:grid-cols-[1fr_1fr_auto]"
            >
              <label className="sr-only" htmlFor="home-q">Search jobs</label>
              <input
                id="home-q"
                name="q"
                placeholder="Job title or keyword"
                className="min-h-12 rounded-xl border border-[#c9d6e2] px-4 text-base text-[#102a43] outline-none transition focus:border-[#20a36a] focus:ring-2 focus:ring-[#20a36a]/30"
              />
              <label className="sr-only" htmlFor="home-location">Location</label>
              <input
                id="home-location"
                name="location"
                placeholder="Location"
                className="min-h-12 rounded-xl border border-[#c9d6e2] px-4 text-base text-[#102a43] outline-none transition focus:border-[#20a36a] focus:ring-2 focus:ring-[#20a36a]/30"
              />
              <button className="min-h-12 rounded-xl bg-[#20a36a] px-5 font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[.98]">
                Search jobs
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="font-semibold text-[#0d3b66]">Popular:</span>
              {popularSearches.map((term) => (
                <Link
                  key={term}
                  href={`/jobs?q=${encodeURIComponent(term)}`}
                  className="inline-flex min-h-11 items-center text-[#52677a] underline decoration-[#b9decf] underline-offset-4 hover:text-[#168057]"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>

          <div className="animate-float rounded-3xl bg-[#0d3b66] p-7 text-white shadow-xl">
            <p className="text-sm font-bold uppercase tracking-[.16em] text-[#8de0b5]">Example</p>
            <h2 className="mt-5 text-3xl font-bold">Kitchen Assistant</h2>
            <p className="mt-2 text-white/75">Cape Town · Part-time</p>
            <div className="mt-8 rounded-2xl bg-white/10 p-4">A practical next step can start here.</div>
          </div>
        </div>
      </section>

      <section id="opportunities" className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.16em] text-[#20a36a]">Explore possibilities</p>
            <h2 className="mt-2 text-3xl font-bold text-[#0d3b66]">Opportunities near you</h2>
          </div>
          <Link
            href="/jobs"
            className="inline-flex min-h-11 items-center gap-2 font-bold text-[#168057]"
          >
            View all jobs <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {jobs.length > 0 ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="job-card block rounded-2xl border border-[#dce6ee] bg-white p-5 shadow-sm"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#eaf2f8] text-[#0d3b66]">
                  <BriefcaseBusiness className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-[#0d3b66]">{job.title}</h3>
                <p className="mt-1 text-sm font-medium text-[#52677a]">{job.company}</p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#71879a]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="size-3.5" aria-hidden="true" />
                    {job.work_type}
                  </span>
                </div>
                <div className="mt-5 border-t border-[#edf1f4] pt-4">
                  <p className="text-sm font-bold text-[#0d3b66]">{job.pay}</p>
                  <p className="mt-1 text-xs text-[#8da0ae]">{postedLabel(job.created_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-2xl border border-[#dce6ee] bg-white p-8 text-[#52677a]">
            No opportunities yet. Check back soon.
          </p>
        )}
      </section>

      <section id="how-it-works" className="border-y border-[#dce6ee] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="text-3xl font-bold text-[#0d3b66]">Your next opportunity is three steps away.</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number}>
                <p className="font-bold text-[#20a36a]">{step.number}</p>
                <h3 className="mt-2 text-lg font-bold text-[#0d3b66]">{step.title}</h3>
                <p className="mt-2 leading-7 text-[#71879a]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-14 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-bold text-[#0d3b66]">Upload your CV once</h2>
          <p className="mt-2 max-w-2xl leading-7 text-[#52677a]">
            Add your CV to your profile so employers can view it when you apply. It stays private.
          </p>
          <Link
            href="/profile#cv"
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#0d3b66] px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[.98]"
          >
            Upload your CV
          </Link>
        </div>
        <div className="rounded-3xl bg-white p-7 shadow-sm">
          <ShieldCheck className="text-[#20a36a]" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold text-[#0d3b66]">Safer connections</h2>
          <p className="mt-2 leading-7 text-[#52677a]">
            Clear job details and safety tips help you make informed choices. Never pay to apply for a job.
          </p>
        </div>
      </section>
    </main>
  )
}
