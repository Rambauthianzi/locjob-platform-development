'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FormShell } from '@/components/form-shell'
import { JobForm } from '@/components/job-form'
import { emptyJobForm, jobToForm, type JobFormValues, type JobPayload } from '@/lib/job-form'
import { JOB_COLUMNS, type JobRow } from '@/lib/jobs'
import { primaryButtonClass } from '@/lib/form-styles'
import { createClient } from '@/lib/supabase/client'

type LoadState = 'loading' | 'missing' | 'ready'

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [state, setState] = useState<LoadState>('loading')
  const [initial, setInitial] = useState<JobFormValues>(emptyJobForm)

  useEffect(() => {
    let active = true
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.replace(`/login?next=/employer/jobs/${id}/edit`)
        return
      }
      // Filtering on employer_id means other people's jobs simply come back empty.
      const { data } = await supabase
        .from('jobs')
        .select(JOB_COLUMNS)
        .eq('id', id)
        .eq('employer_id', user.id)
        .maybeSingle()
      if (!active) return
      if (!data) {
        setState('missing')
        return
      }
      setInitial(jobToForm(data as unknown as JobRow))
      setState('ready')
    }
    load()
    return () => {
      active = false
    }
  }, [id, router])

  async function save(payload: JobPayload) {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.replace(`/login?next=/employer/jobs/${id}/edit`)
      return null
    }

    // employer_id is never sent, so ownership cannot be changed from the form.
    const { data, error } = await supabase
      .from('jobs')
      .update(payload)
      .eq('id', id)
      .eq('employer_id', user.id)
      .select('id')
    if (error) return error.message
    if (!data?.length) return 'We could not update this job. It may have been removed.'

    router.push('/employer/dashboard?notice=updated')
    router.refresh()
    return null
  }

  if (state === 'loading') {
    return (
      <FormShell title="Edit job">
        <div className="mt-6 grid animate-pulse gap-4" aria-busy="true">
          <div className="h-12 rounded-xl bg-[#eef2f5]" />
          <div className="h-12 rounded-xl bg-[#eef2f5]" />
          <div className="h-32 rounded-xl bg-[#eef2f5]" />
        </div>
      </FormShell>
    )
  }

  if (state === 'missing') {
    return (
      <FormShell title="Job not found">
        <p className="mt-4 text-[#52677a]">
          We could not find that job in your employer account. It may have been removed.
        </p>
        <Link href="/employer/dashboard" className={`${primaryButtonClass} mt-6`}>
          Back to your jobs
        </Link>
      </FormShell>
    )
  }

  return (
    <FormShell title="Edit job">
      <JobForm initial={initial} submitLabel="Save changes" busyLabel="Saving…" onSubmit={save} />
    </FormShell>
  )
}
