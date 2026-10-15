'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [role, setRole] = useState<'employee' | 'employer'>('employee')
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', phone: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function update(name: keyof typeof form, value: string) { setForm((current) => ({ ...current, [name]: value })) }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('')
    if (mode === 'register' && form.fullName.trim().length < 2) return setError('Please enter your full name.')
    if (!form.email.trim()) return setError('Email is required.')
    if (form.password.length < 8) return setError('Password must contain at least 8 characters.')
    if (mode === 'register' && form.password !== form.confirmPassword) return setError('Passwords do not match.')
    setLoading(true)
    const supabase = createClient()
    const redirectTo = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password })
      : await supabase.auth.signUp({ email: form.email.trim(), password: form.password, options: { emailRedirectTo: redirectTo, data: { full_name: form.fullName.trim(), role, phone: form.phone.trim() } } })
    setLoading(false)
    if (result.error) {
      const text = result.error.message.toLowerCase()
      if (text.includes('email not confirmed')) return setError('Please confirm your email before signing in.')
      if (text.includes('invalid login')) return setError('Invalid email or password.')
      if (text.includes('rate')) return setError('Too many attempts. Please try again later.')
      return setError('We could not complete that request. Please check your details and try again.')
    }
    if (mode === 'register' && !result.data.session) return setMessage('Registration successful. Check your email to confirm your account before signing in.')
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', result.data.user?.id ?? '').maybeSingle()
    router.push(profile?.role === 'employer' || role === 'employer' ? '/employer/dashboard' : '/dashboard')
  }

  async function resetPassword() {
    setError(''); setMessage('')
    if (!form.email.trim()) return setError('Enter your email first, then choose Forgot password.')
    const { error: resetError } = await createClient().auth.resetPasswordForEmail(form.email.trim(), { redirectTo: `${window.location.origin}/auth/callback?next=/auth?mode=reset` })
    if (resetError) return setError('We could not send a reset email. Please try again.')
    setMessage('Password reset instructions are on their way.')
  }

  return <main className="min-h-screen bg-[#f7f9fb] px-5 py-12 text-[#102a43]"><div className="mx-auto max-w-md rounded-3xl border border-[#dce6ee] bg-white p-7 shadow-sm"><a href="/" className="text-xl font-bold text-[#0d3b66]">Loc<span className="text-[#20a36a]">Job</span></a><h1 className="mt-8 text-3xl font-bold text-[#0d3b66]">{mode === 'login' ? 'Welcome back' : 'Create your profile'}</h1><p className="mt-2 text-sm text-[#71879a]">{mode === 'login' ? 'Sign in to continue your local work journey.' : 'Join a trusted local work community.'}</p><form onSubmit={submit} className="mt-7 flex flex-col gap-4">{mode === 'register' && <><label className="text-sm font-semibold">Full name<input required value={form.fullName} onChange={(e) => update('fullName', e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#dce6ee] px-4 py-3 font-normal outline-none focus:border-[#20a36a]" /></label><label className="text-sm font-semibold">Account type<select value={role} onChange={(e) => setRole(e.target.value as typeof role)} className="mt-1.5 w-full rounded-xl border border-[#dce6ee] bg-white px-4 py-3 font-normal"><option value="employee">Employee</option><option value="employer">Employer</option></select></label></>}<label className="text-sm font-semibold">Email<input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#dce6ee] px-4 py-3 font-normal outline-none focus:border-[#20a36a]" /></label>{mode === 'register' && <label className="text-sm font-semibold">Phone (optional)<input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#dce6ee] px-4 py-3 font-normal outline-none focus:border-[#20a36a]" /></label>}<label className="text-sm font-semibold">Password<div className="relative mt-1.5"><input required type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)} className="w-full rounded-xl border border-[#dce6ee] px-4 py-3 pr-12 font-normal outline-none focus:border-[#20a36a]" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71879a]" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>{mode === 'register' && <label className="text-sm font-semibold">Confirm password<input required type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#dce6ee] px-4 py-3 font-normal outline-none focus:border-[#20a36a]" /></label>}{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p role="status" className="rounded-lg bg-[#e6f6ef] p-3 text-sm text-[#168057]">{message}</p>}<button disabled={loading} className="rounded-xl bg-[#20a36a] px-4 py-3 font-bold text-white disabled:opacity-60">{loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button></form>{mode === 'login' && <button type="button" onClick={resetPassword} className="mt-4 text-sm font-semibold text-[#168057]">Forgot password?</button>}<button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setMessage('') }} className="mt-6 w-full text-sm font-semibold text-[#0d3b66]">{mode === 'login' ? 'Need an account? Register' : 'Already registered? Sign in'}</button></div></main>
}
