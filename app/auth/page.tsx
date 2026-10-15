'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [role, setRole] = useState<'job_seeker' | 'employer'>('job_seeker')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function update(name: string, value: string) { setForm((current) => ({ ...current, [name]: value })) }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('')
    if (!form.email) return setError('Email is required.')
    if (form.password.length < 8) return setError('Password must contain at least 8 characters.')
    if (mode === 'register' && form.password !== form.confirmPassword) return setError('Passwords do not match.')
    setLoading(true)
    const supabase = createClient()
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
      : await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { first_name: form.firstName, last_name: form.lastName, role, phone: form.phone } } })
    setLoading(false)
    if (result.error) return setError(result.error.message)
    if (mode === 'register' && !result.data.session) return setMessage('Registration successful. Check your email to confirm your account.')
    router.push(role === 'employer' ? '/employer/dashboard' : '/dashboard')
  }

  return <main className="min-h-screen bg-[#f7f9fb] px-5 py-12 text-[#102a43]"><div className="mx-auto max-w-md rounded-3xl border border-[#dce6ee] bg-white p-7 shadow-sm"><a href="/" className="text-xl font-bold text-[#0d3b66]">Loc<span className="text-[#20a36a]">Job</span></a><h1 className="mt-8 text-3xl font-bold text-[#0d3b66]">{mode === 'login' ? 'Welcome back' : 'Create your profile'}</h1><p className="mt-2 text-sm text-[#71879a]">{mode === 'login' ? 'Sign in to continue your local work journey.' : 'Join a trusted local work community.'}</p><form onSubmit={submit} className="mt-7 flex flex-col gap-4">{mode === 'register' && <div className="grid gap-4 sm:grid-cols-2"><input required aria-label="First name" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="First name" className="rounded-xl border border-[#dce6ee] px-4 py-3 outline-none focus:border-[#20a36a]" /><input required aria-label="Last name" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="Last name" className="rounded-xl border border-[#dce6ee] px-4 py-3 outline-none focus:border-[#20a36a]" /></div>}<input required type="email" aria-label="Email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="Email address" className="rounded-xl border border-[#dce6ee] px-4 py-3 outline-none focus:border-[#20a36a]" />{mode === 'register' && <input type="tel" aria-label="Phone number" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="Phone number" className="rounded-xl border border-[#dce6ee] px-4 py-3 outline-none focus:border-[#20a36a]" />}<input required type="password" aria-label="Password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Password" className="rounded-xl border border-[#dce6ee] px-4 py-3 outline-none focus:border-[#20a36a]" />{mode === 'register' && <><input required type="password" aria-label="Confirm password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Confirm password" className="rounded-xl border border-[#dce6ee] px-4 py-3 outline-none focus:border-[#20a36a]" /><fieldset className="flex flex-col gap-2"><legend className="text-sm font-semibold text-[#0d3b66]">I am joining as</legend><label className="flex items-center gap-2 text-sm"><input type="radio" checked={role === 'job_seeker'} onChange={() => setRole('job_seeker')} /> Job seeker</label><label className="flex items-center gap-2 text-sm"><input type="radio" checked={role === 'employer'} onChange={() => setRole('employer')} /> Employer / business</label></fieldset></>} {error && <p role="alert" className="rounded-xl bg-[#fff0ee] px-4 py-3 text-sm text-[#b42318]">{error}</p>}{message && <p role="status" className="rounded-xl bg-[#e6f6ef] px-4 py-3 text-sm text-[#168057]">{message}</p>}<button disabled={loading} className="rounded-xl bg-[#0d3b66] px-4 py-3 font-bold text-white disabled:opacity-60">{loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button></form><button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setMessage('') }} className="mt-5 w-full text-sm font-semibold text-[#168057]">{mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}</button></div></main>
}
