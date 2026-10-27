'use client'

import Link from 'next/link'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { FormShell } from '@/components/form-shell'
import { formControlClass, formLabelClass, primaryButtonClass, secondaryButtonClass } from '@/lib/form-styles'
import { createClient } from '@/lib/supabase/client'

type ProfileForm = {
  full_name: string
  phone: string
  location: string
  skills: string
  bio: string
  cv_path: string
}

type Message = { kind: 'error' | 'success'; text: string } | null

const emptyProfile: ProfileForm = { full_name: '', phone: '', location: '', skills: '', bio: '', cv_path: '' }

const CV_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
}
const MAX_CV_BYTES = 5 * 1024 * 1024
const PHONE_PATTERN = /^[+\d][\d\s()-]{6,19}$/

export default function ProfilePage() {
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('employee')
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile)
  const [message, setMessage] = useState<Message>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        if (active) setLoading(false)
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('full_name,phone,location,skills,bio,cv_path,role')
        .eq('id', user.id)
        .maybeSingle()
      if (!active) return
      setUserId(user.id)
      setEmail(user.email ?? '')
      if (data) {
        setRole(data.role)
        // Empty database values become '' so every input stays controlled.
        setProfile({
          full_name: data.full_name ?? '',
          phone: data.phone ?? '',
          location: data.location ?? '',
          skills: data.skills ?? '',
          bio: data.bio ?? '',
          cv_path: data.cv_path ?? '',
        })
      }
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [])

  function update(key: keyof ProfileForm, value: string) {
    setProfile((current) => ({ ...current, [key]: value }))
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    const fullName = profile.full_name.trim()
    const phone = profile.phone.trim()
    if (!fullName) return setMessage({ kind: 'error', text: 'Full name is required.' })
    if (phone && !PHONE_PATTERN.test(phone)) {
      return setMessage({ kind: 'error', text: 'Enter a valid phone number, for example 082 123 4567.' })
    }

    setSaving(true)
    setMessage(null)
    const { error } = await createClient()
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        location: profile.location.trim(),
        bio: profile.bio.trim(),
        skills: profile.skills.trim(),
      })
      .eq('id', userId)
    setSaving(false)
    setMessage(error ? { kind: 'error', text: error.message } : { kind: 'success', text: 'Profile saved successfully.' })
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target
    const file = input.files?.[0]
    input.value = '' // lets the same file be chosen again later
    if (!file || !userId) return

    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!CV_TYPES[ext]) return setMessage({ kind: 'error', text: 'Please upload a PDF, DOC, DOCX or TXT file.' })
    if (file.size > MAX_CV_BYTES) return setMessage({ kind: 'error', text: 'Your CV must be 5 MB or smaller.' })

    setUploading(true)
    setMessage(null)
    const supabase = createClient()
    const previous = profile.cv_path
    const path = `${userId}/cv-${Date.now()}.${ext}`

    // Upload first, then save the path, then delete the old file. A failure at any
    // step leaves the existing CV untouched.
    const uploaded = await supabase.storage
      .from('cv-uploads')
      .upload(path, file, { upsert: false, contentType: CV_TYPES[ext] })
    if (uploaded.error) {
      setUploading(false)
      return setMessage({ kind: 'error', text: uploaded.error.message })
    }

    const updated = await supabase.from('profiles').update({ cv_path: path }).eq('id', userId)
    if (updated.error) {
      await supabase.storage.from('cv-uploads').remove([path])
      setUploading(false)
      return setMessage({ kind: 'error', text: updated.error.message })
    }

    if (previous) await supabase.storage.from('cv-uploads').remove([previous])
    setProfile((current) => ({ ...current, cv_path: path }))
    setUploading(false)
    setMessage({ kind: 'success', text: 'CV uploaded successfully.' })
  }

  async function removeCv() {
    if (!profile.cv_path || !window.confirm('Remove your CV from your profile?')) return
    const supabase = createClient()
    const { error } = await supabase.storage.from('cv-uploads').remove([profile.cv_path])
    if (error) return setMessage({ kind: 'error', text: error.message })

    const updated = await supabase.from('profiles').update({ cv_path: null }).eq('id', userId)
    if (updated.error) return setMessage({ kind: 'error', text: updated.error.message })
    setProfile((current) => ({ ...current, cv_path: '' }))
    setMessage({ kind: 'success', text: 'CV removed.' })
  }

  async function download() {
    if (!profile.cv_path) return
    const popup = window.open('', '_blank')
    const { data, error } = await createClient().storage.from('cv-uploads').createSignedUrl(profile.cv_path, 60)
    if (error || !data?.signedUrl) {
      popup?.close()
      return setMessage({ kind: 'error', text: error?.message ?? 'We could not open your CV.' })
    }
    if (popup) {
      popup.opener = null
      popup.location.href = data.signedUrl
    } else {
      window.location.assign(data.signedUrl)
    }
  }

  if (loading) {
    return (
      <FormShell title="Your profile">
        <div className="mt-6 grid animate-pulse gap-4" aria-busy="true">
          <div className="h-12 rounded-xl bg-[#eef2f5]" />
          <div className="h-12 rounded-xl bg-[#eef2f5]" />
          <div className="h-28 rounded-xl bg-[#eef2f5]" />
        </div>
      </FormShell>
    )
  }

  const fields = [
    ['full_name', 'Full name', 'name'],
    ['phone', 'Phone', 'tel'],
    ['location', 'Location', 'address-level2'],
    ['skills', 'Skills', 'off'],
  ] as const

  return (
    <FormShell title="Your profile">
      <form onSubmit={save} className="mt-6 grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map(([key, label, autoComplete]) => (
            <label key={key} className={formLabelClass}>
              {label}
              <input
                type={key === 'phone' ? 'tel' : 'text'}
                autoComplete={autoComplete}
                value={profile[key]}
                onChange={(event) => update(key, event.target.value)}
                className={formControlClass}
              />
            </label>
          ))}
          <label className={`${formLabelClass} sm:col-span-2`}>
            Email
            <input value={email} readOnly className={`${formControlClass} bg-[#f7f9fb]`} />
          </label>
          <label className={`${formLabelClass} sm:col-span-2`}>
            About you
            <textarea
              value={profile.bio}
              onChange={(event) => update('bio', event.target.value)}
              rows={5}
              className={`${formControlClass} min-h-32`}
            />
          </label>
        </div>

        <button disabled={saving} className={`${primaryButtonClass} w-full sm:w-auto`}>
          {saving ? 'Saving…' : 'Save profile'}
        </button>

        {role === 'employee' && (
          <section id="cv" className="mt-2 border-t border-[#edf1f4] pt-6">
            <h2 className="text-xl font-bold text-[#0d3b66]">Your CV</h2>
            <p className="mt-2 text-sm text-[#71879a]">
              Your CV is private. Only employers you apply to can view it.{' '}
              <Link href="/privacy" className="text-[#168057] underline">
                Read our privacy policy
              </Link>
              .
            </p>
            {profile.cv_path && (
              <p className="mt-4 break-all text-sm font-semibold text-[#102a43]">
                {profile.cv_path.split('/').pop()}
              </p>
            )}
            <label className={`${secondaryButtonClass} mt-4 w-full cursor-pointer sm:w-auto`}>
              {uploading ? 'Uploading…' : profile.cv_path ? 'Replace CV' : 'Choose a CV'}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={upload}
                disabled={uploading}
                className="sr-only"
              />
            </label>
            <p className="mt-2 text-xs text-[#71879a]">PDF, DOC, DOCX or TXT, up to 5 MB.</p>
            {profile.cv_path && (
              <div className="mt-3 flex flex-wrap gap-3">
                <button type="button" onClick={download} className="min-h-11 font-bold text-[#168057]">
                  Download
                </button>
                <button type="button" onClick={removeCv} className="min-h-11 font-bold text-[#9b424a]">
                  Remove CV
                </button>
              </div>
            )}
          </section>
        )}

        {message && (
          <p
            key={message.text}
            role={message.kind === 'error' ? 'alert' : 'status'}
            className={`animate-fade-up font-semibold ${
              message.kind === 'error' ? 'text-red-600' : 'text-[#168057]'
            }`}
          >
            {message.text}
          </p>
        )}
      </form>
    </FormShell>
  )
}
