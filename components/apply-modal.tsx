'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formControlClass, formLabelClass } from '@/lib/form-styles'

export function ApplyModal({ jobId, onClose, onApplied }: { jobId: string; onClose: () => void; onApplied: () => void }) {
  const [note, setNote] = useState(''); const [message, setMessage] = useState(''); const [saving, setSaving] = useState(false)
  async function submit(event: FormEvent) { event.preventDefault(); if (!note.trim()) return setMessage('Please add a cover note.'); setSaving(true); try { const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return setMessage('Please sign in first.'); const { error } = await supabase.from('applications').insert({ job_id: jobId, employee_id: user.id, cover_note: note.trim() }); if (error) return setMessage(error.code === '23505' ? 'You have already applied for this job.' : error.message); setMessage('Application submitted successfully.'); onApplied(); setTimeout(onClose, 900) } finally { setSaving(false) } }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d3b66]/50 p-5"><form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6"><h2 className="text-xl font-bold text-[#0d3b66]">Apply for this job</h2><label className={`${formLabelClass} mt-5 block`}>Cover note<textarea required maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} rows={7} className={`${formControlClass} min-h-32`} /><span className="mt-1 block text-right text-xs text-[#71879a]">{note.length}/2000</span></label><div className="mt-4 flex gap-3"><button type="button" onClick={onClose} className="flex-1 rounded-xl border px-4 py-3 font-bold text-[#52677a]">Cancel</button><button disabled={saving} className="flex-1 rounded-xl bg-[#20a36a] px-4 py-3 font-bold text-white">{saving ? 'Sending…' : 'Submit application'}</button></div>{message && <p className="mt-3 text-sm font-semibold text-[#168057]">{message}</p>}</form></div>
}
