'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { primaryButtonClass, secondaryButtonClass } from '@/lib/form-styles'
import { createClient } from '@/lib/supabase/client'

// The popup is only downloaded when someone actually opens it.
const ApplyModal = dynamic(() => import('./apply-modal').then((module) => module.ApplyModal), { ssr: false })

type Props = { jobId: string; closed: boolean }

export function JobDetailActions({ jobId, closed }: Props) {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [role, setRole] = useState('')
  const [applied, setApplied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!active) return
      setUserId(user?.id ?? null)

      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
        if (!active) return
        setRole(profile?.role ?? '')

        if (profile?.role === 'employee') {
          const [application, savedRow] = await Promise.all([
            supabase.from('applications').select('id').eq('job_id', jobId).eq('employee_id', user.id).maybeSingle(),
            supabase.from('saved_jobs').select('job_id').eq('job_id', jobId).eq('employee_id', user.id).maybeSingle(),
          ])
          if (!active) return
          setApplied(Boolean(application.data))
          setSaved(Boolean(savedRow.data))
        }
      }
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [jobId])

  async function toggleSave() {
    if (!userId) return setMessage('Sign in as a job seeker to save jobs.')

    const supabase = createClient()
    const result = saved
      ? await supabase.from('saved_jobs').delete().match({ job_id: jobId, employee_id: userId })
      : await supabase.from('saved_jobs').insert({ job_id: jobId, employee_id: userId })

    if (result.error) return setMessage('Could not update saved jobs.')
    setMessage('')
    setSaved(!saved)
  }

  if (loading) return <div className="mt-8 h-12 w-56 animate-pulse rounded-xl bg-[#eaf2f8]" />

  if (closed) {
    return <p className="mt-8 rounded-xl bg-[#f7f9fb] p-4 font-bold text-[#71879a]">This job is closed</p>
  }

  if (!userId) {
    return (
      <Link href={`/login?next=/jobs/${jobId}`} className={`${primaryButtonClass} mt-8 w-full sm:w-auto`}>
        Apply now
      </Link>
    )
  }

  if (role === 'employer') {
    return (
      <p className="mt-8 rounded-xl bg-[#f7f9fb] p-4 font-semibold text-[#52677a]">
        Only job seekers can apply for jobs
      </p>
    )
  }

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <button disabled={applied} onClick={() => setOpen(true)} className={primaryButtonClass}>
        {applied ? 'Already applied' : 'Apply now'}
      </button>
      <button onClick={toggleSave} className={secondaryButtonClass}>
        {saved ? 'Saved' : 'Save job'}
      </button>
      {message && (
        <p role="alert" className="w-full text-sm font-semibold text-red-600">
          {message}
        </p>
      )}
      {open && <ApplyModal jobId={jobId} onClose={() => setOpen(false)} onApplied={() => setApplied(true)} />}
    </div>
  )
}
