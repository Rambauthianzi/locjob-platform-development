import { redirect } from 'next/navigation'
import { EmployerJobs, type ApplicantProfile, type EmployerJob } from '@/components/employer-jobs'
import { one } from '@/lib/relations'
import { createClient } from '@/lib/supabase/server'
import type { ApplicationStatus } from '@/lib/types'

type RawApplication = {
  id: string
  status: ApplicationStatus
  cover_note: string
  created_at: string
  profiles: ApplicantProfile | ApplicantProfile[] | null
}

type RawJob = Omit<EmployerJob, 'applications'> & { applications: RawApplication[] | null }

// One query returns every job with its applications and each applicant's profile.
const JOBS_WITH_APPLICATIONS = `
  id, title, company, location, status, created_at,
  applications ( id, status, cover_note, created_at,
    profiles ( full_name, phone, location, bio, skills, cv_path ) )
`

export default async function EmployerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>
}) {
  const { notice } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/employer/dashboard')

  // Both reads run at the same time instead of one after the other.
  const [profileResult, jobsResult] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
    supabase
      .from('jobs')
      .select(JOBS_WITH_APPLICATIONS)
      .eq('employer_id', user.id)
      .order('created_at', { ascending: false })
      .order('created_at', { referencedTable: 'applications', ascending: false }),
  ])

  if (profileResult.data?.role !== 'employer') redirect('/dashboard')

  const jobs: EmployerJob[] = ((jobsResult.data ?? []) as unknown as RawJob[]).map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    status: job.status,
    created_at: job.created_at,
    applications: (job.applications ?? []).map((application) => ({
      id: application.id,
      status: application.status,
      cover_note: application.cover_note,
      created_at: application.created_at,
      profile: one(application.profiles),
    })),
  }))

  return (
    <main className="page-fade min-h-dvh bg-[#f7f9fb] px-4 py-8 text-[#102a43] sm:px-6 lg:px-8">
      {jobsResult.error && (
        <p role="alert" className="mx-auto mb-5 max-w-6xl rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          We could not load all of your jobs. Please refresh the page.
        </p>
      )}
      <EmployerJobs initialJobs={jobs} notice={notice} />
    </main>
  )
}
