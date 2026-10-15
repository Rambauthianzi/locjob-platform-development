'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setLoading(true)
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) { setError(error.message.toLowerCase().includes('not confirmed') ? 'Please confirm your email before signing in.' : 'Invalid email or password.'); return }
    router.push('/dashboard'); router.refresh()
  }

  return <main className="min-h-screen bg-[#f7f9fb] px-5 py-12 text-[#102a43]"><div className="mx-auto max-w-md rounded-3xl border border-[#dce6ee] bg-white p-7 shadow-sm"><Link href="/" className="text-xl font-bold text-[#0d3b66]">Loc<span className="text-[#20a36a]">Job</span></Link><h1 className="mt-8 text-3xl font-bold text-[#0d3b66]">Welcome back</h1><p className="mt-2 text-sm text-[#71879a]">Sign in to continue your local work journey.</p><form onSubmit={submit} className="mt-7 flex flex-col gap-4"><label className="text-sm font-semibold">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#dce6ee] px-4 py-3 font-normal outline-none focus:border-[#20a36a]" /></label><label className="text-sm font-semibold">Password<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#dce6ee] px-4 py-3 font-normal outline-none focus:border-[#20a36a]" /></label>{error && <p role="alert" className="text-sm font-semibold text-red-600">{error}</p>}<button disabled={loading} className="rounded-xl bg-[#0d3b66] px-4 py-3 font-bold text-white disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in'}</button></form><p className="mt-6 text-center text-sm text-[#71879a]">New to LocJob? <Link href="/signup" className="font-bold text-[#168057]">Create an account</Link></p></div></main>
}
