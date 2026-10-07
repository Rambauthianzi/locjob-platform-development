'use client'

import { useMemo, useState } from 'react'
import { BadgeCheck, BriefcaseBusiness, Clock3, MapPin, Search } from 'lucide-react'

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
  const filteredJobs = useMemo(() => jobs.filter((job) => {
    const text = `${job.title} ${job.company} ${job.category}`.toLowerCase()
    return (!query || text.includes(query.toLowerCase())) && (!location || job.location.toLowerCase().includes(location.toLowerCase())) && (type === 'All types' || job.type === type)
  }), [location, query, type])

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
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><div className="flex items-center justify-between"><h2 className="text-xl font-bold text-[#0d3b66]">{filteredJobs.length} opportunities</h2><span className="text-sm text-[#71879a]">Updated for demonstration</span></div><div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredJobs.map((job) => <article key={job.title} className="rounded-2xl border border-[#dce6ee] bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-[#eaf2f8] text-[#0d3b66]"><BriefcaseBusiness className="size-5" /></div>{job.verified && <span className="flex items-center gap-1 rounded-full bg-[#e6f6ef] px-2 py-1 text-xs font-bold text-[#168057]"><BadgeCheck className="size-3.5" /> Verified</span>}</div><h3 className="mt-5 text-lg font-bold text-[#0d3b66]">{job.title}</h3><p className="mt-1 text-sm font-medium text-[#52677a]">{job.company}</p><div className="mt-4 flex flex-col gap-2 text-xs text-[#71879a]"><span className="flex items-center gap-1"><MapPin className="size-3.5" />{job.location}</span><span className="flex items-center gap-1"><Clock3 className="size-3.5" />{job.type}</span></div><div className="mt-5 border-t border-[#edf1f4] pt-4"><p className="text-sm font-bold text-[#0d3b66]">{job.pay}</p><button className="mt-4 w-full rounded-lg border border-[#cde0eb] px-3 py-2 text-xs font-bold text-[#0d3b66] hover:bg-[#f3f8fb]">View details</button></div></article>)}</div>{filteredJobs.length === 0 && <div className="rounded-2xl border border-dashed border-[#b9cbd8] bg-white px-6 py-14 text-center"><h3 className="font-bold text-[#0d3b66]">No opportunities found</h3><p className="mt-2 text-sm text-[#71879a]">Try a different keyword, location, or employment type.</p></div>}</section>
    </main>
  )
}
