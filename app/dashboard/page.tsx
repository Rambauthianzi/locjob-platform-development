import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate, one } from '@/lib/relations'
import { statusClasses, statusLabels, type ApplicationStatus } from '@/lib/types'
import { removeSavedJob } from './actions'

type JobSummary = { id: string; title: string; company: string; location?: string }

const NOTICES: Record<string, string> = {
  'employer-only': 'Only employer accounts can post jobs.',
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>
}) {
  const { notice } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  const [profileResult, applicationsResult, savedResult] = await Promise.all([
    supabase.from('profiles').select('full_name,role,phone,cv_path').eq('id', user.id).maybeSingle(),
    supabase
      .from('applications')
      .select('id,status,cover_note,created_at,jobs(id,title,company)')
      .eq('employee_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('saved_jobs')
      .select('jobs(id,title,company,location)')
      .eq('employee_id', user.id),
  ])

  if (profileResult.data?.role === 'employer') redirect('/employer/dashboard')

  const profile = profileResult.data
  const applications = applicationsResult.data ?? []
  const saved = savedResult.data ?? []
  const displayName = profile?.full_name || user.email?.split('@')[0]

  return (
    <main className="page-fade min-h-dvh bg-[#f7f9fb] px-4 py-8 text-[#102a43] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-bold uppercase tracking-[.16em] text-[#20a36a]">Your workspace</p>
            <h1 className="mt-2 text-balance text-3xl font-bold text-[#0d3b66] sm:text-4xl">
              Good to see you, {displayName}.
            </h1>
          </div>
          <Link href="/jobs" className="inline-flex min-h-11 items-center font-bold text-[#168057]">
            Browse jobs
          </Link>
        </div>

        {notice && NOTICES[notice] && (
          <p role="status" className="mt-6 rounded-2xl bg-[#fff5dc] p-4 text-sm font-semibold text-[#765b13]">
            {NOTICES[notice]}
          </p>
        )}

        {(!profile?.phone || !profile?.cv_path) && (
          <div className="mt-6 rounded-2xl bg-[#fff5dc] p-4 text-sm text-[#765b13]">
            Complete your profile to make your applications stronger.{' '}
            <Link href="/profile" className="font-bold underline">
              Update your profile
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-[#dce6ee] bg-white p-5 sm:p-6">
            <h2 className="text-xl font-bold text-[#0d3b66]">Your applications</h2>
            {applications.length ? (
              <div className="mt-5 grid gap-3">
                {applications.map((item) => {
                  const job = one(item.jobs as unknown as JobSummary | JobSummary[] | null)
                  const status = item.status as ApplicationStatus
                  return (
                    <div key={item.id} className="rounded-xl bg-[#f7f9fb] p-4">
                      {job ? (
                        <Link href={`/jobs/${job.id}`} className="font-bold text-[#0d3b66] hover:underline">
                          {job.title}
                        </Link>
                      ) : (
                        <p className="font-bold text-[#0d3b66]">Job no longer available</p>
                      )}
                      <p className="text-sm text-[#71879a]">{job?.company}</p>
                      <span
                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClasses[status]}`}
                      >
                        {statusLabels[status]}
                      </span>
                      <p className="mt-2 text-xs text-[#71879a]">Applied {formatDate(item.created_at)}</p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl bg-[#f7f9fb] p-5">
                <p className="text-[#71879a]">No applications yet.</p>
                <Link
                  href="/jobs"
                  className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-[#0d3b66] px-4 font-bold text-white"
                >
                  Browse jobs
                </Link>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-[#dce6ee] bg-white p-5 sm:p-6">
            <h2 className="text-xl font-bold text-[#0d3b66]">Saved jobs</h2>
            <div className="mt-5 grid gap-3">
              {saved.map((item) => {
                const job = one(item.jobs as unknown as JobSummary | JobSummary[] | null)
                if (!job) return null
                return (
                  <div
                    key={job.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-[#f7f9fb] p-4"
                  >
                    <Link href={`/jobs/${job.id}`} className="min-w-0">
                      <p className="font-bold text-[#0d3b66]">{job.title}</p>
                      <p className="text-sm text-[#71879a]">
                        {job.company} · {job.location}
                      </p>
                    </Link>
                    <form action={removeSavedJob}>
                      <input type="hidden" name="jobId" value={job.id} />
                      <button className="min-h-11 shrink-0 px-2 font-bold text-[#9b424a]">Remove</button>
                    </form>
                  </div>
                )
              })}
              {!saved.length && <p className="text-[#71879a]">No saved jobs yet.</p>}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
