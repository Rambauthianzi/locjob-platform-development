'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter(); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [error, setError] = useState(''); const [saving, setSaving] = useState(false)
  async function submit(event: FormEvent) { event.preventDefault(); setError(''); if (password.length < 8) return setError('Password must contain at least 8 characters.'); if (password !== confirm) return setError('Passwords do not match.'); setSaving(true); const { error } = await createClient().auth.updateUser({ password }); setSaving(false); if (error) return setError(error.message); router.push('/dashboard') }
  return <main className="min-h-screen bg-[#f7f9fb] px-5 py-12"><form onSubmit={submit} className="mx-auto max-w-md rounded-3xl border border-[#dce6ee] bg-white p-7"><h1 className="text-3xl font-bold text-[#0d3b66]">Choose a new password</h1><label className="mt-7 block text-sm font-semibold">New password<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#dce6ee] px-4 py-3 outline-none focus:border-[#20a36a]" /></label><label className="mt-4 block text-sm font-semibold">Confirm password<input required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#dce6ee] px-4 py-3 outline-none focus:border-[#20a36a]" /></label><button disabled={saving} className="mt-6 w-full rounded-xl bg-[#20a36a] px-4 py-3 font-bold text-white">{saving ? 'Saving…' : 'Update password'}</button>{error && <p className="mt-3 text-sm text-red-600">{error}</p>}</form></main>
}
