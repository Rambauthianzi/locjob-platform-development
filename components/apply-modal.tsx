'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formControlClass, formLabelClass, primaryButtonClass, secondaryButtonClass } from '@/lib/form-styles'

type ApplyModalProps = {
  jobId: string
  onClose: () => void
  onApplied: () => void
}

export function ApplyModal({ jobId, onClose, onApplied }: ApplyModalProps) {
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  // Close with the Escape key.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    if (!note.trim()) return setMessage('Please add a cover note.')

    setSaving(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return setMessage('Please sign in first.')

      const { error } = await supabase.from('applications').insert({
        job_id: jobId,
        employee_id: user.id,
        cover_note: note.trim(),
      })
      if (error) {
        return setMessage(error.code === '23505' ? 'You have already applied for this job.' : error.message)
      }

      setDone(true)
      onApplied()
      setTimeout(onClose, 1400)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="animate-fade fixed inset-0 z-50 flex items-end justify-center bg-[#0d3b66]/50 backdrop-blur-sm sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <form
        onSubmit={submit}
        className="animate-pop max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl"
      >
        {done ? (
          <div className="py-8 text-center" role="status">
            <svg viewBox="0 0 52 52" className="mx-auto size-16 text-[#20a36a]" aria-hidden="true">
              <circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="3" opacity=".25" />
              <path
                className="check-draw"
                d="M14 27l9 9 16-18"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-4 text-lg font-bold text-[#0d3b66]">Application submitted successfully</p>
          </div>
        ) : (
          <>
            <h2 id="apply-title" className="text-xl font-bold text-[#0d3b66]">
              Apply for this job
            </h2>
            <label className={`${formLabelClass} mt-5 block`}>
              Cover note
              <textarea
                required
                autoFocus
                maxLength={2000}
                rows={7}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className={`${formControlClass} min-h-32`}
              />
              <span className="mt-1 block text-right text-xs text-[#71879a]">{note.length}/2000</span>
            </label>

            {message && (
              <p key={message} role="alert" className="animate-shake mt-3 text-sm font-semibold text-red-700">
                {message}
              </p>
            )}

            <div className="mt-4 flex gap-3">
              <button type="button" onClick={onClose} className={`${secondaryButtonClass} flex-1`}>
                Cancel
              </button>
              <button disabled={saving} className={`${primaryButtonClass} flex-1`}>
                {saving ? 'Sending…' : 'Submit application'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
