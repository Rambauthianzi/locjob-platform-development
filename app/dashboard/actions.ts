'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// Removes one saved job for the signed-in user, then refreshes the dashboard.
export async function removeSavedJob(formData: FormData) {
  const jobId = String(formData.get('jobId') ?? '')
  if (!jobId) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('saved_jobs').delete().eq('job_id', jobId).eq('employee_id', user.id)
  revalidatePath('/dashboard')
}
