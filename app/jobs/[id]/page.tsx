import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { JobDetailActions } from '@/components/job-detail-actions'
import { JOB_COLUMNS, mapJob, postedLabel, type JobRow } from '@/lib/jobs'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

// One database read shared by generateMetadata and the page itself.
const getJob = cache(async (id: string) => {
  const supabase = await createClient()
  const { data } = await supabase.from('jobs').select(JOB_COLUMNS).eq('id', id).maybeSingle()
  return (data as unknown as JobRow | null) ?? null
})

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const job = await getJob(id)
  if (!job) return { title: 'Job not found' }

  const description = job.description.slice(0, 150)
  return {
    title: `${job.title} at ${job.company} in ${job.location}`,
    description,
    openGraph: { title: `${job.title} at ${job.company}`, description },
  }
}

export default async function JobDetails({ params }: Params) {
  const { id } = await params
  const row = await getJob(id)
  if (!row) notFound()
  const job = mapJob(row)

  return (
    <main className="page-fade min-h-dvh bg-[#f7f9fb] text-[#102a43]">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Link href="/jobs" className="inline-flex min-h-11 items-center text-sm font-bold text-[#168057]">
          ← Back to jobs
        </Link>

        <article className="mt-4 rounded-3xl border border-[#dce6ee] bg-white p-5 shadow-sm sm:p-7">
          <p className="text-sm font-bold uppercase tracking-[.16em] text-[#20a36a]">{job.category}</p>
          <h1 className="mt-3 text-balance text-3xl font-bold text-[#0d3b66] sm:text-4xl">{job.title}</h1>
          <p className="mt-2 text-lg font-semibold text-[#52677a]">{job.company}</p>

          <div className="mt-6 grid gap-3 rounded-2xl bg-[#eef6f3] p-5 text-sm sm:grid-cols-3">
            <span>{job.location}</span>
            <span>{job.work_type}</span>
            <span className="font-bold">{job.pay}</span>
          </div>
          <p className="mt-3 text-xs text-[#8da0ae]">{postedLabel(job.created_at)}</p>

          <h2 className="mt-8 text-xl font-bold text-[#0d3b66]">About this opportunity</h2>
          <p className="mt-3 whitespace-pre-line leading-7 text-[#52677a]">{job.description}</p>

          {job.requirements?.trim() && (
            <>
              <h2 className="mt-8 text-xl font-bold text-[#0d3b66]">Requirements</h2>
              <p className="mt-3 whitespace-pre-line leading-7 text-[#52677a]">{job.requirements}</p>
            </>
          )}

          <p className="mt-6 rounded-xl bg-[#fff5dc] p-4 text-sm text-[#765b13]">
            Never pay to apply. Never share your ID or bank details early.
          </p>

          <JobDetailActions jobId={job.id} closed={job.status === 'closed'} />
        </article>
      </div>
    </main>
  )
}
