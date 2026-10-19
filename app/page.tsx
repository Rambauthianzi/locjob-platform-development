'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CircleUserRound,
  ChevronDown,
  Clock3,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Upload,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const jobs = [
  { title: 'Garden Assistant', company: 'Greenway Gardens', location: 'Cape Town, Western Cape', type: 'Part-time', pay: 'R3,500 – R5,000 / month', posted: '2 days ago', category: 'Gardening & maintenance', verified: true },
  { title: 'Retail Store Assistant', company: 'Mokoena Market', location: 'Soweto, Gauteng', type: 'Casual work', pay: 'R280 / day', posted: '3 days ago', category: 'Retail', verified: true },
  { title: 'Social Media Assistant', company: 'Brightside Studio', location: 'Umhlanga, KwaZulu-Natal', type: 'Freelance', pay: 'R4,000 – R6,500 / month', posted: '5 days ago', category: 'Digital marketing', verified: false },
  { title: 'Event Helper', company: 'Ubuntu Events Co.', location: 'Gqeberha, Eastern Cape', type: 'One-time task', pay: 'R650 / event', posted: '1 week ago', category: 'Events & community', verified: true },
]

const categories = ['Retail', 'Hospitality', 'Admin & office', 'Gardening', 'Events', 'Digital work']

export default function Page() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [searched, setSearched] = useState(false)
  const [cvName, setCvName] = useState('')
  const [cvStatus, setCvStatus] = useState('')
  const [cvUploaded, setCvUploaded] = useState(false)
  const [profile, setProfile] = useState({ name: '', email: '', skills: '' })
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => { createClient().auth.getUser().then(({ data }) => setLoggedIn(Boolean(data.user))) }, [])

  async function signOut() { await createClient().auth.signOut(); setLoggedIn(false) }

  async function uploadCv(file: File) {
    setCvName(file.name)
    setCvStatus('Uploading your CV…')
    const supabase = createClient()
    const path = `cv/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`
    const { error } = await supabase.storage.from('cv-uploads').upload(path, file, { upsert: false })
    if (error) {
      setCvStatus('Your CV is selected, but storage needs the cv-uploads bucket configured.')
      return
    }
    setProfile((current) => ({ ...current, name: file.name.replace(/\\.(pdf|docx?|txt)$/i, '').replace(/[-_]/g, ' ') }))
    setCvUploaded(true)
    setCvStatus('Thank you — your CV is uploaded and your application profile has been auto-filled.')
  }

  const filteredJobs = useMemo(() => {
    if (!searched) return jobs
    const normalizedQuery = query.toLowerCase()
    const normalizedLocation = location.toLowerCase()
    return jobs.filter((job) =>
      (!normalizedQuery || `${job.title} ${job.category} ${job.company}`.toLowerCase().includes(normalizedQuery)) &&
      (!normalizedLocation || job.location.toLowerCase().includes(normalizedLocation)),
    )
  }, [location, query, searched])

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSearched(true)
    document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f9fb] text-[#102a43]">
      <header className="border-b border-[#dce6ee] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="#top" className="flex items-center gap-2.5" aria-label="LocJob home">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#0d3b66] text-white shadow-sm"><BriefcaseBusiness /></span>
            <span className="text-xl font-bold tracking-tight text-[#0d3b66]">Loc<span className="text-[#20a36a]">Job</span></span>
          </a>
          <nav className="hidden items-center gap-8 text-base font-semibold text-[#52677a] lg:flex" aria-label="Main navigation">
            <a className="text-[#0d3b66] transition hover:text-[#168057]" href="#top">Home</a><a className="transition hover:text-[#168057]" href="#opportunities">Browse jobs</a><a className="transition hover:text-[#168057]" href="#how-it-works">How it works</a><a className="transition hover:text-[#168057]" href="#trust">About us</a>
          </nav>
          <div className="hidden items-center gap-3 lg:flex"><a href="/dashboard" className="px-3 py-2 text-sm font-semibold text-[#0d3b66]">Dashboard</a>{loggedIn && <a href="/profile" aria-label="Open your profile" title="Profile" className="rounded-lg p-2 text-[#0d3b66] transition hover:bg-[#e6f6ef] hover:text-[#168057]"><CircleUserRound /></a>}{loggedIn ? <button onClick={signOut} className="px-3 py-2 text-sm font-semibold text-[#0d3b66]">Sign out</button> : <><a href="/login" className="px-3 py-2 text-sm font-semibold text-[#0d3b66]">Sign in</a><a href="/signup" className="rounded-lg bg-[#0d3b66] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#082b4b]">Get started</a></>}</div>
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>{mobileOpen ? <X /> : <Menu />}</button>
        </div>
        {mobileOpen && <nav className="flex flex-col gap-4 border-t border-[#dce6ee] px-5 py-5 text-sm font-semibold lg:hidden"><a href="#top" onClick={() => setMobileOpen(false)}>Home</a><a href="#opportunities" onClick={() => setMobileOpen(false)}>Browse jobs</a><a href="#how-it-works" onClick={() => setMobileOpen(false)}>How it works</a><a href="#register" onClick={() => setMobileOpen(false)}>Get started</a></nav>}
      </header>

      <section id="top" className="relative bg-[#eef6f3]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b9decf] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[.14em] text-[#168057]"><Sparkles className="size-3.5" /> Built for your community</div>
            <h1 className="max-w-2xl text-5xl font-bold leading-[1.05] tracking-[-.04em] text-[#0d3b66] md:text-6xl">Find opportunities <span className="text-[#20a36a]">right where you are.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#52677a]">Discover local jobs, part-time work, freelance gigs, and entry-level opportunities near you.</p>
            <form onSubmit={submitSearch} className="mt-9 rounded-2xl border border-[#dce6ee] bg-white p-2 shadow-[0_12px_40px_rgba(13,59,102,.10)]">
              <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                <label className="flex items-center gap-3 rounded-xl px-3 py-2.5 focus-within:bg-[#f5f9fb]"><Search className="size-5 shrink-0 text-[#7b90a3]" /><span className="sr-only">Search jobs</span><input value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 w-full bg-transparent text-sm outline-none placeholder:text-[#8da0ae]" placeholder="Job title or keyword" /></label>
                <label className="flex items-center gap-3 rounded-xl px-3 py-2.5 focus-within:bg-[#f5f9fb]"><MapPin className="size-5 shrink-0 text-[#7b90a3]" /><span className="sr-only">Search location</span><input value={location} onChange={(e) => setLocation(e.target.value)} className="min-w-0 w-full bg-transparent text-sm outline-none placeholder:text-[#8da0ae]" placeholder="City, suburb or province" /></label>
                <button className="rounded-xl bg-[#20a36a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#168057]" type="submit">Search jobs</button>
              </div>
            </form>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#52677a]"><span className="font-semibold text-[#0d3b66]">Popular:</span>{['Retail', 'Hospitality', 'Admin'].map((item) => <button key={item} onClick={() => { setQuery(item); setSearched(true) }} className="underline decoration-[#b9decf] underline-offset-4 hover:text-[#168057]">{item}</button>)}</div>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:justify-self-end"><div className="absolute -right-5 -top-5 size-24 rounded-full bg-[#ccecdf]" /><div className="absolute -bottom-7 -left-7 size-20 rounded-full bg-[#f9d99b]" /><div className="relative rounded-[2rem] bg-[#0d3b66] p-7 shadow-[0_20px_60px_rgba(13,59,102,.22)]"><div className="flex items-center justify-between text-white"><div><p className="text-sm text-[#b8d0e1]">Your next step</p><p className="mt-1 text-2xl font-bold">Start local.</p></div><div className="flex size-12 items-center justify-center rounded-2xl bg-[#20a36a]"><MapPin /></div></div><div className="mt-8 space-y-3"><div className="rounded-2xl bg-white p-4"><div className="flex items-start justify-between"><div><p className="font-bold text-[#0d3b66]">Kitchen Assistant</p><p className="mt-1 text-xs text-[#71879a]">Khayelitsha · Part-time</p></div><BadgeCheck className="size-5 text-[#20a36a]" /></div><div className="mt-4 flex items-center justify-between text-xs font-semibold"><span className="text-[#52677a]">R4,200 / month</span><span className="rounded-full bg-[#e6f6ef] px-2 py-1 text-[#168057]">New</span></div></div><div className="rounded-2xl bg-[#204f78] p-4 text-white"><p className="font-bold">Build experience that matters</p><p className="mt-1 text-xs leading-5 text-[#c8d9e6]">Small steps can open big doors in your community.</p></div></div></div></div>
        </div>
      </section>

      <section id="opportunities" className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#20a36a]">Explore possibilities</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0d3b66]">Opportunities near you</h2><p className="mt-2 text-[#71879a]">A few places to start building your future.</p></div><a href="/jobs" className="flex items-center gap-2 text-sm font-bold text-[#168057]">View all jobs <ArrowRight className="size-4" /></a></div><div className="mt-8 grid gap-4 md:grid-cols-2">{filteredJobs.map((job) => <article key={job.title} className="rounded-2xl border border-[#dce6ee] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-4"><div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#eaf2f8] text-[#0d3b66]"><BriefcaseBusiness className="size-5" /></div>{job.verified && <span className="flex items-center gap-1 rounded-full bg-[#e6f6ef] px-2.5 py-1 text-xs font-bold text-[#168057]"><BadgeCheck className="size-3.5" /> Verified</span>}</div><h3 className="mt-5 text-lg font-bold text-[#0d3b66]">{job.title}</h3><p className="mt-1 text-sm font-medium text-[#52677a]">{job.company}</p><div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#71879a]"><span className="flex items-center gap-1"><MapPin className="size-3.5" />{job.location}</span><span className="flex items-center gap-1"><Clock3 className="size-3.5" />{job.type}</span></div><div className="mt-5 flex items-end justify-between border-t border-[#edf1f4] pt-4"><div><p className="text-sm font-bold text-[#0d3b66]">{job.pay}</p><p className="mt-1 text-xs text-[#8da0ae]">Posted {job.posted}</p></div><a href={`/jobs/${job.title === 'Garden Assistant' ? 'demo-garden' : job.title === 'Retail Store Assistant' ? 'demo-retail' : job.title === 'Social Media Assistant' ? 'demo-social' : 'demo-event'}`} className="rounded-lg border border-[#cde0eb] px-3 py-2 text-xs font-bold text-[#0d3b66] hover:bg-[#f3f8fb]">View details</a></div></article>)}</div>{searched && filteredJobs.length === 0 && <div className="mt-5 rounded-2xl border border-dashed border-[#b9decf] bg-[#eef6f3] p-8 text-center"><p className="font-bold text-[#0d3b66]">No opportunities found yet</p><p className="mt-1 text-sm text-[#71879a]">Try a broader keyword or nearby location.</p></div>}</section>

      <section id="profile" className="border-y border-[#dce6ee] bg-white"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[.85fr_1.15fr] lg:px-8"><div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#20a36a]">Apply faster</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0d3b66]">Upload your CV once.</h2><p className="mt-3 leading-7 text-[#71879a]">We&apos;ll use it to pre-fill your application profile, so you can spend less time typing and more time finding the right opportunity.</p><label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#b9decf] bg-[#f5fbf8] px-6 py-8 text-center transition hover:border-[#20a36a]"><Upload className="size-7 text-[#20a36a]" /><span className="mt-3 font-bold text-[#0d3b66]">Choose your CV</span><span className="mt-1 text-xs text-[#71879a]">PDF, DOC, DOCX or TXT</span><input type="file" accept=".pdf,.doc,.docx,.txt" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadCv(file) }} /></label>{cvName && <p className="mt-3 text-sm text-[#52677a]">Selected: <span className="font-semibold">{cvName}</span></p>}{cvStatus && <p className="mt-2 text-sm font-semibold text-[#168057]" role="status">{cvStatus}</p>}{cvUploaded && <div className="mt-5 rounded-2xl border border-[#b9decf] bg-white p-4"><p className="font-bold text-[#0d3b66]">Recommended for your CV</p><p className="mt-1 text-sm text-[#71879a]">Based on the skills in your uploaded CV, these opportunities are a strong place to start.</p><div className="mt-3 flex flex-wrap gap-2">{['Garden Assistant', 'Retail Store Assistant', 'Event Helper'].map((title) => <a key={title} href="/jobs" className="rounded-full bg-[#e6f6ef] px-3 py-1.5 text-xs font-bold text-[#168057] transition hover:bg-[#ccecdf]">{title}</a>)}</div></div>}</div><div className="rounded-2xl border border-[#dce6ee] bg-[#f7f9fb] p-6"><h3 className="text-lg font-bold text-[#0d3b66]">Application profile</h3><p className="mt-1 text-sm text-[#71879a]">These details will be ready when you apply.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-[#52677a]">Full name<input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} className="mt-2 w-full rounded-lg border border-[#cde0eb] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#20a36a]" placeholder="Your name" /></label><label className="text-sm font-semibold text-[#52677a]">Email<input value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} className="mt-2 w-full rounded-lg border border-[#cde0eb] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#20a36a]" placeholder="you@example.com" type="email" /></label><label className="text-sm font-semibold text-[#52677a] sm:col-span-2">Skills<input value={profile.skills} onChange={(event) => setProfile({ ...profile, skills: event.target.value })} className="mt-2 w-full rounded-lg border border-[#cde0eb] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#20a36a]" placeholder="e.g. customer service, gardening, admin" /></label></div></div></div></section>

      <section id="how-it-works" className="border-y border-[#dce6ee] bg-white"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="max-w-xl"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#20a36a]">Simple by design</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0d3b66]">Your next opportunity is three steps away.</h2></div><div className="mt-10 grid gap-8 md:grid-cols-3">{[{n:'01',title:'Create your profile',body:'Tell us what you can do, where you are, and what kind of work you are looking for.'},{n:'02',title:'Find your match',body:'Browse local opportunities that fit your skills, schedule, and preferred location.'},{n:'03',title:'Take your next step',body:'Apply with confidence and start building real experience in your community.'}].map((step) => <div key={step.n}><span className="text-sm font-bold text-[#20a36a]">{step.n}</span><h3 className="mt-3 text-lg font-bold text-[#0d3b66]">{step.title}</h3><p className="mt-2 leading-7 text-[#71879a]">{step.body}</p></div>)}</div></div></section>

      <section id="trust" className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="grid gap-10 rounded-3xl bg-[#0d3b66] p-8 text-white md:grid-cols-[1fr_1.2fr] md:p-12"><div><p className="text-sm font-bold uppercase tracking-[.16em] text-[#79d5ad]">Built on trust</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Local opportunities. Real experience.</h2><p className="mt-4 max-w-md leading-7 text-[#c8d9e6]">LocJob helps young South Africans make meaningful connections to work while giving local employers an easier way to find the right people.</p></div><div className="grid gap-5 sm:grid-cols-2"><div className="rounded-2xl bg-white/10 p-5"><ShieldCheck className="size-6 text-[#79d5ad]" /><h3 className="mt-4 font-bold">Safer connections</h3><p className="mt-2 text-sm leading-6 text-[#c8d9e6]">Verified employers and clear job details help you make informed choices.</p></div><div className="rounded-2xl bg-white/10 p-5"><Users className="size-6 text-[#79d5ad]" /><h3 className="mt-4 font-bold">Made for community</h3><p className="mt-2 text-sm leading-6 text-[#c8d9e6]">Find work closer to home, from people and businesses in your area.</p></div></div></div></section>

      <footer className="border-t border-[#dce6ee] bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 text-sm text-[#71879a] md:flex-row md:items-center md:justify-between lg:px-8"><div><p className="font-bold text-[#0d3b66]">Loc<span className="text-[#20a36a]">Job</span></p><p className="mt-1">Local opportunities. Real experience.</p></div><div className="flex flex-wrap gap-5"><a href="#privacy">Privacy</a><a href="#terms">Terms</a><a href="#help">Help centre</a><a href="#contact">Contact</a></div><p>© 2026 LocJob</p></div></footer>
    </main>
  )
}
