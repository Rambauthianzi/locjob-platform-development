import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const demoJobs = {
  'demo-garden': { title: 'Garden Assistant', company: 'Greenway Gardens', location: 'Cape Town, Western Cape', type: 'Part-time', pay: 'R3,500 – R5,000 / month', category: 'Gardening & maintenance', description: 'Support the team with planting, watering, pruning, and keeping gardens tidy.' },
  'demo-retail': { title: 'Retail Store Assistant', company: 'Mokoena Market', location: 'Soweto, Gauteng', type: 'Casual work', pay: 'R280 / day', category: 'Retail', description: 'Help customers, restock shelves, and keep the store welcoming and organised.' },
  'demo-social': { title: 'Social Media Assistant', company: 'Brightside Studio', location: 'Umhlanga, KwaZulu-Natal', type: 'Freelance', pay: 'R4,000 – R6,500 / month', category: 'Digital marketing', description: 'Create social content, schedule posts, and help local brands grow online.' },
  'demo-event': { title: 'Event Helper', company: 'Ubuntu Events Co.', location: 'Gqeberha, Eastern Cape', type: 'One-time task', pay: 'R650 / event', category: 'Events & community', description: 'Help set up, welcome guests, and pack down community events.' },
}

export default async function JobDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const fallback = demoJobs[id as keyof typeof demoJobs]
  const supabase = await createClient()
  const { data } = fallback ? { data: null } : await supabase.from('jobs').select('title,company,location,work_type,payment_amount,payment_frequency,category,description').eq('id', id).maybeSingle()
  const job = fallback ?? (data ? { title: data.title, company: data.company, location: data.location, type: data.work_type, pay: `R${Number(data.payment_amount).toLocaleString()} / ${data.payment_frequency.replace('Per ', '').toLowerCase()}`, category: data.category, description: data.description } : null)
  if (!job) notFound()
  return <main className="min-h-screen bg-[#f7f9fb] px-5 py-10 text-[#102a43]"><div className="mx-auto max-w-3xl"><Link href="/jobs" className="text-sm font-bold text-[#168057]">← Back to jobs</Link><article className="mt-6 rounded-3xl border border-[#dce6ee] bg-white p-7 shadow-sm"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#20a36a]">{job.category}</p><h1 className="mt-3 text-4xl font-bold text-[#0d3b66]">{job.title}</h1><p className="mt-2 text-lg font-semibold text-[#52677a]">{job.company}</p><div className="mt-6 grid gap-3 rounded-2xl bg-[#eef6f3] p-5 text-sm sm:grid-cols-3"><span>{job.location}</span><span>{job.type}</span><span className="font-bold">{job.pay}</span></div><h2 className="mt-8 text-xl font-bold text-[#0d3b66]">About this opportunity</h2><p className="mt-3 leading-7 text-[#52677a]">{job.description}</p><Link href={`/login?next=/jobs/${id}`} className="mt-8 inline-flex rounded-xl bg-[#20a36a] px-5 py-3 font-bold text-white hover:bg-[#168057]">Apply now</Link></article></div></main>
}
