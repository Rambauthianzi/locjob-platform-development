import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

function related<T>(value: T | T[] | null): T | null { return Array.isArray(value) ? value[0] ?? null : value }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')
  const { data: profile } = await supabase.from('profiles').select('full_name,role').eq('id', user.id).maybeSingle()
  if (profile?.role === 'employer') redirect('/employer/dashboard')
  const { data: applications } = await supabase.from('applications').select('status,cover_note,jobs(title,company)').eq('employee_id', user.id).order('created_at', { ascending: false })
  const { data: saved } = await supabase.from('saved_jobs').select('jobs(id,title,company,location)').eq('employee_id', user.id)
  const hour = new Date().getHours()
  const greeting = hour >= 20 ? 'Good evening' : hour >= 12 ? 'Good afternoon' : 'Good morning'
  return <main className="min-h-screen bg-[#f7f9fb] px-5 py-10 text-[#102a43]"><div className="mx-auto max-w-6xl"><div className="flex items-end justify-between"><div><p className="font-bold uppercase tracking-[.16em] text-[#20a36a]">Your workspace</p><h1 className="mt-2 text-4xl font-bold text-[#0d3b66]">{greeting}, {profile?.full_name || user.email?.split('@')[0]}.</h1></div><Link href="/jobs" className="font-bold text-[#168057]">Browse jobs</Link></div><div className="mt-8 grid gap-6 lg:grid-cols-2"><section className="rounded-3xl border border-[#dce6ee] bg-white p-6"><h2 className="text-xl font-bold text-[#0d3b66]">Your applications</h2><div className="mt-5 grid gap-3">{applications?.map((item) => { const job = related(item.jobs as unknown as { title: string; company: string } | { title: string; company: string }[]); return <div key={`${item.status}-${item.cover_note}`} className="rounded-xl bg-[#f7f9fb] p-4"><p className="font-bold text-[#0d3b66]">{job?.title}</p><p className="text-sm text-[#71879a]">{job?.company}</p><span className="mt-2 inline-block rounded-full bg-[#e6f6ef] px-3 py-1 text-xs font-bold text-[#168057]">{item.status}</span></div> })}{!applications?.length && <p className="text-[#71879a]">No applications yet.</p>}</div></section><section className="rounded-3xl border border-[#dce6ee] bg-white p-6"><h2 className="text-xl font-bold text-[#0d3b66]">Saved jobs</h2><div className="mt-5 grid gap-3">{saved?.map((item) => { const job = related(item.jobs as unknown as { id: string; title: string; company: string } | { id: string; title: string; company: string }[]); return job && <Link key={job.id} href={`/jobs/${job.id}`} className="rounded-xl bg-[#f7f9fb] p-4"><p className="font-bold text-[#0d3b66]">{job.title}</p><p className="text-sm text-[#71879a]">{job.company}</p></Link> })}{!saved?.length && <p className="text-[#71879a]">No saved jobs yet.</p>}</div></section></div></div></main>
}
