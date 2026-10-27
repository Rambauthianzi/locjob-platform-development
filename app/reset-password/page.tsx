'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { FormShell } from '@/components/form-shell'
import { createClient } from '@/lib/supabase/client'
import {
  formControlClass,
  formLabelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '@/lib/form-styles'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [hasSession, setHasSession] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => setHasSession(Boolean(data.session)))
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    if (password.length < 8) return setMessage('Use at least 8 characters.')
    if (password !== confirm) return setMessage('Passwords do not match.')

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) return setMessage(error.message)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id ?? '')
        .maybeSingle()

      router.push(profile?.role === 'employer' ? '/employer/dashboard' : '/dashboard')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (hasSession === null) {
    return (
      <FormShell title="Set a new password">
        <p className="mt-6 text-[#52677a]">Loading…</p>
      </FormShell>
    )
  }

  if (!hasSession) {
    return (
      <FormShell title="Set a new password">
        <p className="mt-6 text-[#52677a]">This reset link is missing or has expired.</p>
        <Link href="/forgot-password" className={`${primaryButtonClass} mt-5`}>
          Request a new link
        </Link>
      </FormShell>
    )
  }

  return (
    <FormShell title="Set a new password">
      <form onSubmit={submit} className="stagger mt-6 grid gap-5">
        <label className={formLabelClass}>
          New password
          <div className="flex gap-2">
            <input
              required
              minLength={8}
              autoComplete="new-password"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={formControlClass}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? 'Hide password' : 'Show password'}
              className={`${secondaryButtonClass} mt-1.5 px-4`}
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>
        <label className={formLabelClass}>
          Confirm password
          <input
            required
            autoComplete="new-password"
            type={show ? 'text' : 'password'}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className={formControlClass}
          />
        </label>
        {message && (
          <p key={message} role="alert" className="animate-shake text-sm font-semibold text-red-700">
            {message}
          </p>
        )}
        <button disabled={loading} className={primaryButtonClass}>
          {loading ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </FormShell>
  )
}
