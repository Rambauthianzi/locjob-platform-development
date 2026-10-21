import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { mapJob, type JobRow } from '@/lib/jobs'

export default async function EmployerDashboard() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/login?next=/employer/dashboard')
  const { data: profile } = await supabase.from('profiles').select('role,full_name').eq('id', user.id).maybeSingle(); if (profile?.role !== 'employer') redirect('/dashboard')
  const { data } = await supabase.from('jobs').select('*').eq('employer_id', user.id).order('created_at', { ascending: false })
  const jobs = (data ?? []) as JobRow[]
  return <main className="min-h-screen bg-[#f7f9fb] px-5 py-12 text-[#102a43]"><div className="mx-auto max-w-6xl"><div className="flex items-center justify-between"><div><p className="font-bold text-[#20a36a]">Employer workspace</p><h1 className="mt-2 text-4xl font-bold text-[#0d3b66]">Your jobs</h1></div><Link href="/employer/jobs/new" className="rounded-xl bg-[#20a36a] px-4 py-3 font-bold text-white">Post a job</Link></div><div className="mt-8 grid gap-4">{jobs.map((row) => { const job = mapJob(row); return <article key={job.id} className="rounded-2xl border border-[#dce6ee] bg-white p-6"><div className="flex items-start justify-between"><div><h2 className="text-xl font-bold text-[#0d3b66]">{job.title}</h2><p className="mt-1 text-[#71879a]">{job.company} · {job.location}</p></div><span className="rounded-full bg-[#eef6f3] px-3 py-1 text-sm font-bold text-[#168057]">{job.status}</span></div><p className="mt-4 text-[#52677a]">{job.description}</p></article> })}{jobs.length === 0 && <p className="rounded-2xl border border-[#dce6ee] bg-white p-8">No jobs posted yet.</p>}</div></div></main>
}
