'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { FormShell } from '@/components/form-shell'
import { createClient } from '@/lib/supabase/client'
import { formControlClass, formLabelClass, primaryButtonClass } from '@/lib/form-styles'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    try {
      await createClient().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/reset-password')}`,
      })
    } finally {
      // Always show the same message so we never reveal which emails have accounts.
      setLoading(false)
      setSent(true)
    }
  }

  return (
    <FormShell title="Forgot password?">
      {sent ? (
        <div className="animate-fade-up mt-6" role="status">
          <svg viewBox="0 0 52 52" className="size-14 text-[#20a36a]" aria-hidden="true">
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
          <p className="mt-4 text-[#52677a]">
            If an account exists for that email, we&apos;ve sent a reset link.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="stagger mt-6 grid gap-5">
          <p className="text-[#52677a]">
            Enter your email and we&apos;ll send you a link to set a new password.
          </p>
          <label className={formLabelClass}>
            Email
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={formControlClass}
            />
          </label>
          <button disabled={loading} className={primaryButtonClass}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}

      <Link href="/login" className="mt-6 inline-flex min-h-11 items-center font-semibold text-[#168057]">
        Back to sign in
      </Link>
    </FormShell>
  )
}
