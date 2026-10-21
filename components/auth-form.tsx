'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthForm({ mode, nextParam, errorParam }: { mode: 'login' | 'register'; nextParam?: string; errorParam?: string }) {
  const router = useRouter()
  const next = nextParam?.startsWith('/') && !nextParam.startsWith('//') && !nextParam.startsWith('/\\') ? nextParam : undefined
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' })
  const [role, setRole] = useState<'employee' | 'employer'>('employee')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState(errorParam === 'link_expired' ? 'That link has expired. Please request a new one.' : '')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('')
    if (mode === 'register' && !consent) return setError('Please agree to the Terms and Privacy Policy.')
    setLoading(true)
    const supabase = createClient()
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password })
      : await supabase.auth.signUp({ email: form.email.trim(), password: form.password, options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data: { full_name: form.fullName.trim(), role, phone: form.phone.trim() } } })
    setLoading(false)
    if (result.error) return setError(result.error.message.includes('Invalid login') ? 'Invalid email or password.' : result.error.message)
    if (mode === 'register' && !result.data.session) return setMessage('Registration successful. Check your email to confirm your account.')
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', result.data.user?.id ?? '').maybeSingle()
    router.push(next ?? (profile?.role === 'employer' || role === 'employer' ? '/employer/dashboard' : '/dashboard'))
  }

  return <main className="min-h-screen bg-[#f7f9fb] px-5 py-12 text-[#102a43]"><div className="mx-auto max-w-md rounded-3xl border border-[#dce6ee] bg-white p-7 shadow-sm"><a href="/" className="text-xl font-bold text-[#0d3b66]">Loc<span className="text-[#20a36a]">Job</span></a><h1 className="mt-8 text-3xl font-bold text-[#0d3b66]">{mode === 'login' ? 'Welcome back' : 'Create your profile'}</h1><form onSubmit={submit} className="mt-7 flex flex-col gap-4">{mode === 'register' && <><label className="text-sm font-semibold">Full name<input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-1.5 w-full rounded-xl border border-[#dce6ee] px-4 py-3 outline-none focus:border-[#20a36a]" /></label><label className="text-sm font-semibold">Account type<select value={role} onChange={(e) => setRole(e.target.value as typeof role)} className="mt-1.5 w-full rounded-xl border border-[#dce6ee] bg-white px-4 py-3"><option value="employee">Employee</option><option value="employer">Employer</option></select></label><label className="text-sm font-semibold">Phone (optional)<input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5 w-full rounded-xl border border-[#dce6ee] px-4 py-3 outline-none focus:border-[#20a36a]" /></label></>}<label className="text-sm font-semibold">Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 w-full rounded-xl border border-[#dce6ee] px-4 py-3 outline-none focus:border-[#20a36a]" /></label><label className="text-sm font-semibold">Password<input required minLength={8} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1.5 w-full rounded-xl border border-[#dce6ee] px-4 py-3 outline-none focus:border-[#20a36a]" /></label>{mode === 'register' && <label className="flex items-start gap-2 text-sm"><input required type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 accent-[#20a36a]" /><span>I agree to the <a className="text-[#168057] underline" href="/terms">Terms</a> and <a className="text-[#168057] underline" href="/privacy">Privacy Policy</a>.</span></label>}<button disabled={loading} className="rounded-xl bg-[#20a36a] px-4 py-3 font-bold text-white transition hover:bg-[#168057] disabled:opacity-60">{loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>{error && <p role="alert" className="text-sm font-semibold text-red-600">{error}</p>}{message && <p role="status" className="text-sm font-semibold text-[#168057]">{message}</p>}</form><div className="mt-5 text-sm text-[#71879a]">{mode === 'login' ? <>Need an account? <a href="/signup" className="font-bold text-[#168057]">Get started</a></> : <>Already registered? <a href="/login" className="font-bold text-[#168057]">Sign in</a></>}</div></div></main>
}
