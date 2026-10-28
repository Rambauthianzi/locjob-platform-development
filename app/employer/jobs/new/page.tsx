'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FormShell } from '@/components/form-shell'
import { JobForm } from '@/components/job-form'
import { emptyJobForm, type JobPayload } from '@/lib/job-form'
import { createClient } from '@/lib/supabase/client'

export default function NewJobPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  // Only signed-in employers may post. Everyone else is sent somewhere sensible.
  useEffect(() => {
    let active = true
    async function check() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login?next=/employer/jobs/new')
        return
      }
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
      if (!active) return
      if (data?.role !== 'employer') {
        router.replace('/dashboard?notice=employer-only')
        return
      }
      setReady(true)
    }
    check()
    return () => {
      active = false
    }
  }, [router])

  async function save(payload: JobPayload) {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.replace('/login?next=/employer/jobs/new')
      return null
    }

    const { error } = await supabase
      .from('jobs')
      .insert({ ...payload, employer_id: user.id, status: 'published' })
    if (error) {
      return error.code === '42501' ? 'Only employer accounts can post jobs.' : error.message
    }

    router.push('/employer/dashboard?notice=posted')
    router.refresh()
    return null
  }

  if (!ready) {
    return (
      <FormShell title="Post a job">
        <div className="mt-6 grid animate-pulse gap-4" aria-busy="true">
          <div className="h-12 rounded-xl bg-[#eef2f5]" />
          <div className="h-12 rounded-xl bg-[#eef2f5]" />
          <div className="h-32 rounded-xl bg-[#eef2f5]" />
        </div>
      </FormShell>
    )
  }

  return (
    <FormShell title="Post a job">
      <JobForm initial={emptyJobForm} submitLabel="Publish job" busyLabel="Publishing…" onSubmit={save} />
    </FormShell>
  )
}
