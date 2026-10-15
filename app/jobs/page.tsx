'use client'

import { useEffect, useState } from 'react'
import { BadgeCheck, BriefcaseBusiness, Clock3, Heart, MapPin, Search, Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const jobs = [
  { title: 'Garden Assistant', company: 'Greenway Gardens', location: 'Cape Town, Western Cape', type: 'Part-time', pay: 'R3,500 – R5,000 / month', category: 'Gardening & maintenance', verified: true },
  { title: 'Retail Store Assistant', company: 'Mokoena Market', location: 'Soweto, Gauteng', type: 'Casual work', pay: 'R280 / day', category: 'Retail', verified: true },
  { title: 'Social Media Assistant', company: 'Brightside Studio', location: 'Umhlanga, KwaZulu-Natal', type: 'Freelance', pay: 'R4,000 – R6,500 / month', category: 'Digital marketing', verified: false },
  { title: 'Event Helper', company: 'Ubuntu Events Co.', location: 'Gqeberha, Eastern Cape', type: 'One-time task', pay: 'R650 / event', category: 'Events & community', verified: true },
  { title: 'Data Capturer', company: 'Cedar Admin Services', location: 'Polokwane, Limpopo', type: 'Entry-level full-time', pay: 'R6,500 / month', category: 'Administration', verified: true },
  { title: 'Restaurant Assistant', company: 'Sundown Kitchen', location: 'Mbombela, Mpumalanga', type: 'Casual work', pay: 'R320 / day', category: 'Hospitality', verified: false },
]

export default function JobsPage() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('All types')
  const [jobFile, setJobFile] = useState('')
  const [jobStatus, setJobStatus] = useState('')
  const [showPostForm, setShowPostForm] = useState(false)
  const [showApplication, setShowApplication] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [postedJobs, setPostedJobs] = useState<typeof jobs>([])
  const [newJob, setNewJob] = useState({ title: '', company: '', location: '', type: 'Part-time', pay: '', category: '' })
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  async function uploadJob(file: File) {
    setJobFile(file.name)
    setJobStatus('Uploading job post…')
    const supabase = createClient()
    const path = `job-posts/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`
    const { error } = await supabase.storage.from('job-posts').upload(path, file, { upsert: false })
    setJobStatus(error ? 'Job selected, but storage needs the job-posts bucket configured.' : 'Job post uploaded for review.')
  }

  async function addJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!newJob.title || !newJob.company || !newJob.location || !newJob.pay) return

    if (userId) {
      const supabase = createClient()
      const amount = Number(newJob.pay.replace(/[^0-9.]/g, '')) || 0
      const { error } = await supabase.from('jobs').insert({
        employer_id: userId,
        title: newJob.title,
        company: newJob.company,
        description: `${newJob.title} opportunity at ${newJob.company}.`,
        location: newJob.location,
        requirements: '',
        payment_amount: amount,
        payment_frequency: 'Per Month',
        work_type: newJob.type === 'Full-time' ? 'Full-Time' : newJob.type === 'Part-time' ? 'Part-Time' : newJob.type === 'Freelance' ? 'Freelance' : 'Casual/Gig',
        category: newJob.category,
      })
      if (error) {
        setJobStatus('Please complete an employer profile before publishing this job.')
        return
      }
    } else {
      setPostedJobs((current) => [{ ...newJob, posted: 'just now', verified: false }, ...current] as typeof jobs)
    }

    setNewJob({ title: '', company: '', location: '', type: 'Part-time', pay: '', category: '' })
    setShowPostForm(false)
    setJobStatus(userId ? 'Your job post is live in Explore possibilities.' : 'Sign in to save this job post permanently.')
  }

  const allJobs = [...postedJobs, ...jobs]
  const visibleJobs = allJobs.filter((job) => {
    const text = `${job.title} ${job.company} ${job.category}`.toLowerCase()
    return (!query || text.includes(query.toLowerCase())) && (!location || job.location.toLowerCase().includes(location.toLowerCase())) && (type === 'All types' || job.type === type)
  })

  return (
    <main className="min-h-screen bg-[#f7f9fb] text-[#102a43]">
      <header className="border-b border-[#dce6ee] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="/" className="flex items-center gap-2.5" aria-label="LocJob home"><span className="flex size-10 items-center justify-center rounded-xl bg-[#0d3b66] text-white"><BriefcaseBusiness /></span><span className="text-xl font-bold tracking-tight text-[#0d3b66]">Loc<span className="text-[#20a36a]">Job</span></span></a>
          <a href="/" className="text-sm font-bold text-[#168057]">Back to home</a>
        </div>
      </header>
      <section className="border-b border-[#dce6ee] bg-[#eef6f3]">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#20a36a]">Demonstration directory</p><h1 className="mt-2 text-4xl font-bold tracking-tight text-[#0d3b66]">Find work near you.</h1><p className="mt-3 max-w-xl text-[#52677a]">Explore sample opportunities across South Africa. Live Supabase listings can be connected once the database schema is configured.</p><div className="mt-7 grid gap-3 rounded-2xl border border-[#dce6ee] bg-white p-3 shadow-sm md:grid-cols-[1.3fr_1fr_220px]"><label className="flex items-center gap-3 rounded-xl bg-[#f7f9fb] px-3 py-3"><Search className="size-5 text-[#7b90a3]" /><span className="sr-only">Search jobs</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Job title, skill or category" /></label><label className="flex items-center gap-3 rounded-xl bg-[#f7f9fb] px-3 py-3"><MapPin className="size-5 text-[#7b90a3]" /><span className="sr-only">Search location</span><input value={location} onChange={(event) => setLocation(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="City, suburb or province" /></label><label className="flex items-center rounded-xl bg-[#f7f9fb] px-3"><span className="sr-only">Employment type</span><select value={type} onChange={(event) => setType(event.target.value)} className="w-full bg-transparent py-3 text-sm outline-none"><option>All types</option>{[...new Set(jobs.map((job) => job.type))].map((item) => <option key={item}>{item}</option>)}</select></label></div></div>
      </section>
      <section id="post-a-job" className="mx-auto max-w-7xl px-5 pt-12 lg:px-8"><div className="grid gap-6 rounded-3xl bg-[#0d3b66] p-7 text-white md:grid-cols-[1fr_auto] md:items-center md:p-9"><div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#79d5ad]">For employers</p><h2 className="mt-2 text-2xl font-bold">Have a job to share?</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#c8d9e6]">Upload a job description and our team can review it before publishing to the local directory.</p></div><div className="flex flex-wrap gap-3"><button type="button" onClick={() => setShowPostForm(true)} className="rounded-xl bg-[#20a36a] px-5 py-3 text-sm font-bold text-white hover:bg-[#168057]">Post a job</button><label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"><Upload className="size-4" /> Upload a job<input type="file" accept=".pdf,.doc,.docx,.txt" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadJob(file) }} /></label></div></div>{jobFile && <p className="mt-3 text-sm text-[#52677a]" role="status">{jobFile} · {jobStatus}</p>}</section>
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><div className="flex items-center justify-between"><h2 className="text-xl font-bold text-[#0d3b66]">{visibleJobs.length} opportunities</h2><span className="text-sm text-[#71879a]">Updated for demonstration</span></div><div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{visibleJobs.map((job) => <article key={job.title} className="rounded-2xl border border-[#dce6ee] bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-[#eaf2f8] text-[#0d3b66]"><BriefcaseBusiness className="size-5" /></div><button type="button" onClick={() => setFavorites((current) => current.includes(job.title) ? current.filter((item) => item !== job.title) : [...current, job.title])} aria-label={favorites.includes(job.title) ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`} className={`rounded-full p-2 ${favorites.includes(job.title) ? 'bg-[#e6f6ef] text-[#168057]' : 'bg-[#f7f9fb] text-[#7b90a3]'} hover:text-[#168057]`}><Heart className="size-4" fill={favorites.includes(job.title) ? 'currentColor' : 'none'} /></button>{job.verified && <span className="flex items-center gap-1 rounded-full bg-[#e6f6ef] px-2 py-1 text-xs font-bold text-[#168057]"><BadgeCheck className="size-3.5" /> Verified</span>}</div><h3 className="mt-5 text-lg font-bold text-[#0d3b66]">{job.title}</h3><p className="mt-1 text-sm font-medium text-[#52677a]">{job.company}</p><div className="mt-4 flex flex-col gap-2 text-xs text-[#71879a]"><span className="flex items-center gap-1"><MapPin className="size-3.5" />{job.location}</span><span className="flex items-center gap-1"><Clock3 className="size-3.5" />{job.type}</span></div><div className="mt-5 border-t border-[#edf1f4] pt-4"><p className="text-sm font-bold text-[#0d3b66]">{job.pay}</p><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => setShowDetails(job.title)} className="rounded-lg border border-[#cde0eb] px-3 py-2 text-xs font-bold text-[#0d3b66] hover:bg-[#f3f8fb]">View details</button><button type="button" onClick={() => setShowApplication(job.title)} className="rounded-lg bg-[#20a36a] px-3 py-2 text-xs font-bold text-white hover:bg-[#168057]">Apply now</button></div></div></article>)}</div>{visibleJobs.length === 0 && <div className="rounded-2xl border border-dashed border-[#b9cbd8] bg-white px-6 py-14 text-center"><h3 className="font-bold text-[#0d3b66]">No opportunities found</h3><p className="mt-2 text-sm text-[#71879a]">Try a different keyword, location, or employment type.</p></div>}</section>
      {showPostForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d3b66]/50 p-5" role="dialog" aria-modal="true" aria-labelledby="post-job-title"><form onSubmit={addJob} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 id="post-job-title" className="text-xl font-bold text-[#0d3b66]">Post a local job</h2><button type="button" onClick={() => setShowPostForm(false)} aria-label="Close"><X /></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{([['title', 'Job title'], ['company', 'Company'], ['location', 'Location'], ['pay', 'Pay']]).map(([key, label]) => <label key={key} className="text-sm font-semibold text-[#52677a]">{label}<input required value={newJob[key as keyof typeof newJob]} onChange={(event) => setNewJob({ ...newJob, [key]: event.target.value })} className="mt-1.5 w-full rounded-lg border border-[#cde0eb] px-3 py-2.5 font-normal outline-none focus:border-[#20a36a]" /></label>)}<label className="text-sm font-semibold text-[#52677a]">Employment type<select value={newJob.type} onChange={(event) => setNewJob({ ...newJob, type: event.target.value })} className="mt-1.5 w-full rounded-lg border border-[#cde0eb] bg-white px-3 py-2.5 font-normal"><option>Part-time</option><option>Casual work</option><option>Freelance</option><option>Full-time</option></select></label><label className="text-sm font-semibold text-[#52677a]">Category<input value={newJob.category} onChange={(event) => setNewJob({ ...newJob, category: event.target.value })} className="mt-1.5 w-full rounded-lg border border-[#cde0eb] px-3 py-2.5 font-normal" /></label></div><button className="mt-6 w-full rounded-lg bg-[#20a36a] px-4 py-3 font-bold text-white hover:bg-[#168057]">Publish job</button></form></div>}
      {showDetails && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d3b66]/50 p-5"><div className="w-full max-w-md rounded-2xl bg-white p-6"><div className="flex justify-between"><h2 className="text-xl font-bold text-[#0d3b66]">{showDetails}</h2><button type="button" onClick={() => setShowDetails(null)} aria-label="Close"><X /></button></div><p className="mt-3 leading-7 text-[#52677a]">Review the role details and apply when you are ready. This opportunity is currently accepting applications.</p><button type="button" onClick={() => { setShowDetails(null); setShowApplication(showDetails) }} className="mt-5 w-full rounded-lg bg-[#20a36a] px-4 py-3 font-bold text-white">Apply now</button></div></div>}
      {showApplication && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d3b66]/50 p-5"><form onSubmit={(event) => { event.preventDefault(); setShowApplication(null); setJobStatus(`Application started for ${showApplication}.`) }} className="w-full max-w-md rounded-2xl bg-white p-6"><div className="flex justify-between"><h2 className="text-xl font-bold text-[#0d3b66]">Apply for {showApplication}</h2><button type="button" onClick={() => setShowApplication(null)} aria-label="Close"><X /></button></div><label className="mt-5 block text-sm font-semibold text-[#52677a]">Your email<input required type="email" className="mt-1.5 w-full rounded-lg border border-[#cde0eb] px-3 py-2.5 font-normal" placeholder="you@example.com" /></label><button className="mt-5 w-full rounded-lg bg-[#20a36a] px-4 py-3 font-bold text-white">Submit application</button></form></div>}
    </main>
  )
}
