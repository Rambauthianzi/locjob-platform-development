import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { mapJob, type Job, workTypes } from '@/lib/jobs'
import { JobsBrowser } from '@/components/jobs-browser'

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ q?: string; location?: string; type?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  let query = supabase.from('jobs').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(12)
  if (params.q) query = query.or(`title.ilike.%${params.q}%,company.ilike.%${params.q}%,category.ilike.%${params.q}%`)
  if (params.location) query = query.ilike('location', `%${params.location}%`)
  if (params.type && workTypes.includes(params.type as typeof workTypes[number]) && params.type !== 'All types') query = query.eq('work_type', params.type)
  const { data } = await query
  const jobs = (data ?? []).map(mapJob as (row: Record<string, unknown>) => Job)
  return <main className="min-h-screen bg-[#f7f9fb] text-[#102a43]"><header className="border-b border-[#dce6ee] bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8"><Link href="/" className="text-xl font-bold text-[#0d3b66]">Loc<span className="text-[#20a36a]">Job</span></Link><Link href="/dashboard" className="font-bold text-[#168057]">Dashboard</Link></div></header><section className="border-b border-[#dce6ee] bg-[#eef6f3]"><div className="mx-auto max-w-7xl px-5 py-14 lg:px-8"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#20a36a]">Explore possibilities</p><h1 className="mt-2 text-4xl font-bold text-[#0d3b66]">Find work near you.</h1></div></section><JobsBrowser initialJobs={jobs} /></main>
}
