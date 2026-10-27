'use client'

import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { FormShell } from '@/components/form-shell'
import {
  formControlClass,
  formLabelClass,
  formSelectClass,
  primaryButtonClass,
} from '@/lib/form-styles'
import { createClient } from '@/lib/supabase/client'

type Role = 'employee' | 'employer'

type AuthFormProps = {
  mode: 'login' | 'register'
  nextParam?: string
  errorParam?: string
}

// Only same-site paths are allowed, so a crafted ?next= link cannot send people elsewhere.
function safeNext(value?: string) {
  if (!value) return undefined
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return undefined
  return value
}

export function AuthForm({ mode, nextParam, errorParam }: AuthFormProps) {
  const router = useRouter()
  const next = safeNext(nextParam)
  const isRegister = mode === 'register'

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '', phone: '' })
  const [role, setRole] = useState<Role>('employee')
  const [consent, setConsent] = useState(false)
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(
    errorParam === 'link_expired' ? 'That link has expired. Please request a new one.' : '',
  )

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (isRegister) {
      if (form.password !== form.confirm) return setError('Passwords do not match.')
      if (!consent) return setError('Please agree to the Terms and Privacy Policy.')
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const email = form.email.trim()

      const result = isRegister
        ? await supabase.auth.signUp({
            email,
            password: form.password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
              data: { full_name: form.fullName.trim(), role, phone: form.phone.trim() },
            },
          })
        : await supabase.auth.signInWithPassword({ email, password: form.password })

      if (result.error) {
        setError(result.error.message.includes('Invalid login') ? 'Invalid email or password.' : result.error.message)
        return
      }
      if (isRegister && !result.data.session) {
        setMessage('Registration successful. Check your email to confirm your account.')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', result.data.user?.id ?? '')
        .maybeSingle()
      const isEmployer = profile?.role === 'employer' || (isRegister && role === 'employer')

      router.push(next ?? (isEmployer ? '/employer/dashboard' : '/dashboard'))
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShow((value) => !value)}
      aria-label={show ? 'Hide password' : 'Show password'}
      className="absolute right-2 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center text-[#52677a]"
    >
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  )

  return (
    <FormShell title={isRegister ? 'Create your account' : 'Welcome back'} aside>
      <form onSubmit={submit} className="stagger mt-7 grid gap-4">
        {isRegister && (
          <>
            <label className={formLabelClass}>
              Full name
              <input
                required
                autoComplete="name"
                value={form.fullName}
                onChange={(event) => update('fullName', event.target.value)}
                className={formControlClass}
              />
            </label>
            <label className={formLabelClass}>
              Phone
              <input
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(event) => update('phone', event.target.value)}
                className={formControlClass}
              />
            </label>
            <label className={formLabelClass}>
              I am joining as
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as Role)}
                className={formSelectClass}
              >
                <option value="employee">Job seeker</option>
                <option value="employer">Employer</option>
              </select>
            </label>
          </>
        )}

        <label className={formLabelClass}>
          Email
          <input
            required
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            className={formControlClass}
          />
        </label>

        <label className={formLabelClass}>
          Password
          <div className="relative">
            <input
              required
              minLength={isRegister ? 8 : undefined}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              type={show ? 'text' : 'password'}
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              className={`${formControlClass} pr-12`}
            />
            {passwordToggle}
          </div>
        </label>

        {isRegister ? (
          <>
            <label className={formLabelClass}>
              Confirm password
              <input
                required
                autoComplete="new-password"
                type={show ? 'text' : 'password'}
                value={form.confirm}
                onChange={(event) => update('confirm', event.target.value)}
                className={formControlClass}
              />
            </label>
            <label className="flex items-start gap-2 text-sm text-[#102a43]">
              <input
                required
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-1 size-4 accent-[#20a36a]"
              />
              <span>
                I agree to the{' '}
                <Link href="/terms" className="font-bold underline">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-bold underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </>
        ) : (
          <Link href="/forgot-password" className="-mt-2 inline-flex min-h-11 items-center text-sm font-bold text-[#168057]">
            Forgot password?
          </Link>
        )}

        {error && (
          <p key={error} role="alert" className="animate-shake text-sm font-semibold text-red-600">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="text-sm font-semibold text-[#168057]">
            {message}
          </p>
        )}

        <button disabled={loading} className={primaryButtonClass}>
          {loading ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
        </button>
      </form>
    </FormShell>
  )
}
