import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { JobsBrowser } from '@/components/jobs-browser'
import { JOB_COLUMNS, mapJob, workTypes, type JobRow } from '@/lib/jobs'
import { createPublicClient } from '@/lib/supabase/public'

export const metadata: Metadata = {
  title: 'Browse jobs',
  description: 'Find real local jobs and opportunities on LocJob.',
}

const PAGE_SIZE = 12

type SearchParams = { q?: string; location?: string; type?: string; page?: string }

// Strip characters that would break the PostgREST filter string.
function cleanKeyword(value: string) {
  return value.replace(/[(),\\%*]/g, '').trim().slice(0, 60)
}

// Cached for 60 seconds per unique search, so repeat visitors are served instantly.
// Errors are thrown (not returned) so a failed query is never cached.
const loadJobs = unstable_cache(
  async (q: string, location: string, type: string, page: number) => {
    const supabase = createPublicClient()
    let query = supabase
      .from('jobs')
      .select(JOB_COLUMNS, { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (q) {
      query = query.or(
        `title.ilike.%${q}%,company.ilike.%${q}%,category.ilike.%${q}%,description.ilike.%${q}%`,
      )
    }
    if (location) query = query.ilike('location', `%${location}%`)
    if (type) query = query.eq('work_type', type)

    const from = (page - 1) * PAGE_SIZE
    const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(error.message)

    return { rows: (data ?? []) as unknown as JobRow[], count: count ?? 0 }
  },
  ['jobs-list'],
  { revalidate: 60 },
)

export default async function JobsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams

  const q = cleanKeyword(params.q ?? '')
  const location = (params.location ?? '').trim().slice(0, 60)
  const type =
    params.type && params.type !== 'All types' && (workTypes as readonly string[]).includes(params.type)
      ? params.type
      : ''
  const page = Math.min(1000, Math.max(1, Math.floor(Number(params.page)) || 1))

  let rows: JobRow[] = []
  let total = 0
  let failed = false
  try {
    const result = await loadJobs(q, location, type, page)
    rows = result.rows
    total = result.count
  } catch {
    failed = true
  }

  return (
    <main className="page-fade min-h-dvh bg-[#f7f9fb]">
      <section className="bg-[#eef6f3] px-5 py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[.16em] text-[#20a36a]">Explore possibilities</p>
          <h1 className="mt-2 text-balance text-3xl font-bold text-[#0d3b66] sm:text-4xl">Find work near you.</h1>
        </div>
      </section>
      <JobsBrowser
        initialJobs={rows.map(mapJob)}
        initialFilters={{ q, location, type }}
        total={total}
        page={page}
        error={failed ? 'Unable to load jobs.' : undefined}
      />
    </main>
  )
}
