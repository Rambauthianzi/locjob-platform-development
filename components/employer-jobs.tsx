'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/relations'
import { statusClasses, statusLabels, type ApplicationStatus } from '@/lib/types'

export type ApplicantProfile = {
  full_name: string
  phone: string | null
  location: string | null
  bio: string | null
  skills: string | null
  cv_path: string | null
}

export type EmployerApplication = {
  id: string
  status: ApplicationStatus
  cover_note: string
  created_at: string
  profile: ApplicantProfile | null
}

export type EmployerJob = {
  id: string
  title: string
  company: string
  location: string
  status: 'published' | 'closed'
  created_at: string
  applications: EmployerApplication[]
}

type Feedback = { kind: 'error' | 'success'; text: string } | null

const NOTICES: Record<string, string> = {
  posted: 'Your job is live and visible to job seekers.',
  updated: 'Job updated.',
}

const STATUS_OPTIONS: ApplicationStatus[] = ['submitted', 'reviewing', 'accepted', 'rejected']

export function EmployerJobs({ initialJobs, notice }: { initialJobs: EmployerJob[]; notice?: string }) {
  const [jobs, setJobs] = useState(initialJobs)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(
    notice && NOTICES[notice] ? { kind: 'success', text: NOTICES[notice] } : null,
  )

  const openJobs = jobs.filter((job) => job.status === 'published').length
  const totalApplications = jobs.reduce((sum, job) => sum + job.applications.length, 0)
  const awaiting = jobs.reduce(
    (sum, job) => sum + job.applications.filter((item) => item.status === 'submitted').length,
    0,
  )

  async function toggleJob(job: EmployerJob) {
    const next: EmployerJob['status'] = job.status === 'published' ? 'closed' : 'published'
    setBusyId(job.id)
    const { data, error } = await createClient()
      .from('jobs')
      .update({ status: next })
      .eq('id', job.id)
      .select('id')
    setBusyId(null)

    // A policy refusal returns no error but also no rows, so check both.
    if (error || !data?.length) {
      setFeedback({ kind: 'error', text: error?.message ?? 'We could not update this job.' })
      return
    }
    setJobs((current) => current.map((item) => (item.id === job.id ? { ...item, status: next } : item)))
    setFeedback({
      kind: 'success',
      text: next === 'closed' ? 'Job closed. It no longer appears in search.' : 'Job reopened and visible again.',
    })
  }

  async function updateStatus(jobId: string, applicationId: string, status: ApplicationStatus) {
    setBusyId(applicationId)
    const { data, error } = await createClient()
      .from('applications')
      .update({ status })
      .eq('id', applicationId)
      .select('id')
    setBusyId(null)

    if (error || !data?.length) {
      setFeedback({ kind: 'error', text: error?.message ?? 'We could not change that status.' })
      return
    }
    setJobs((current) =>
      current.map((job) =>
        job.id === jobId
          ? {
              ...job,
              applications: job.applications.map((item) =>
                item.id === applicationId ? { ...item, status } : item,
              ),
            }
          : job,
      ),
    )
    setFeedback({ kind: 'success', text: `Application marked as ${statusLabels[status].toLowerCase()}.` })
  }

  async function viewCv(path: string) {
    // Open the tab first so mobile browsers do not block it as a pop-up.
    const popup = window.open('', '_blank')
    const { data, error } = await createClient().storage.from('cv-uploads').createSignedUrl(path, 60)
    if (error || !data?.signedUrl) {
      popup?.close()
      setFeedback({ kind: 'error', text: error?.message ?? 'We could not open that CV.' })
      return
    }
    if (popup) {
      popup.opener = null
      popup.location.href = data.signedUrl
    } else {
      window.location.assign(data.signedUrl)
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-bold uppercase tracking-[.16em] text-[#20a36a]">Employer workspace</p>
          <h1 className="mt-2 text-balance text-3xl font-bold text-[#0d3b66] sm:text-4xl">Your jobs</h1>
        </div>
        <Link
          href="/employer/jobs/new"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#20a36a] px-5 font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[.98]"
        >
          Post a job
        </Link>
      </div>

      {feedback && (
        <p
          key={feedback.text}
          role={feedback.kind === 'error' ? 'alert' : 'status'}
          className={`animate-fade-up mt-5 rounded-xl p-4 text-sm font-semibold ${
            feedback.kind === 'error' ? 'bg-red-50 text-red-700' : 'bg-[#e2f6eb] text-[#168057]'
          }`}
        >
          {feedback.text}
        </p>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ['Open jobs', openJobs],
          ['Total applications', totalApplications],
          ['Awaiting review', awaiting],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-[#dce6ee] bg-white p-5">
            <p className="text-3xl font-bold text-[#0d3b66]">{value}</p>
            <p className="mt-1 text-sm text-[#71879a]">{label}</p>
          </div>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-[#dce6ee] bg-white p-8 text-center">
          <h2 className="text-xl font-bold text-[#0d3b66]">You have not posted any jobs yet</h2>
          <p className="mt-2 text-[#52677a]">Post your first opportunity and job seekers can start applying.</p>
          <Link
            href="/employer/jobs/new"
            className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-[#20a36a] px-5 font-bold text-white"
          >
            Post a job
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5">
          {jobs.map((job) => {
            const isOpen = job.status === 'published'
            return (
              <article key={job.id} className="rounded-2xl border border-[#dce6ee] bg-white p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-[#0d3b66]">{job.title}</h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          isOpen ? 'bg-[#e2f6eb] text-[#168057]' : 'bg-[#eef2f5] text-[#52677a]'
                        }`}
                      >
                        {isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <p className="mt-1 text-[#71879a]">
                      {job.company} · {job.location}
                    </p>
                    <p className="mt-2 text-sm text-[#52677a]">
                      {job.applications.length} application{job.applications.length === 1 ? '' : 's'} · Posted{' '}
                      {formatDate(job.created_at)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    <Link
                      href={`/employer/jobs/${job.id}/edit`}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#c9d6e2] px-4 font-bold text-[#168057]"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#c9d6e2] px-4 font-bold text-[#168057]"
                    >
                      View job
                    </Link>
                    <button
                      onClick={() => toggleJob(job)}
                      disabled={busyId === job.id}
                      className="col-span-2 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#eef6f3] px-4 font-bold text-[#168057] disabled:opacity-60 sm:col-span-1"
                    >
                      {isOpen ? 'Close job' : 'Reopen job'}
                    </button>
                  </div>
                </div>

                <details className="mt-5 border-t border-[#edf1f4] pt-4" open={job.applications.length > 0}>
                  <summary className="min-h-11 cursor-pointer font-bold text-[#0d3b66]">
                    Applications ({job.applications.length})
                  </summary>
                  {job.applications.length === 0 ? (
                    <p className="mt-3 text-sm text-[#71879a]">No applications yet.</p>
                  ) : (
                    <div className="mt-3 grid gap-3">
                      {job.applications.map((application) => {
                        const person = application.profile
                        return (
                          <div key={application.id} className="rounded-xl bg-[#f7f9fb] p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="font-bold text-[#0d3b66]">{person?.full_name || 'Applicant'}</p>
                                <p className="text-sm text-[#52677a]">
                                  {person?.phone ? (
                                    <a href={`tel:${person.phone}`} className="underline">
                                      {person.phone}
                                    </a>
                                  ) : (
                                    'No phone'
                                  )}{' '}
                                  · {person?.location || 'No location'}
                                </p>
                              </div>
                              <span
                                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${statusClasses[application.status]}`}
                              >
                                {statusLabels[application.status]}
                              </span>
                            </div>
                            {person?.bio && <p className="mt-3 text-sm text-[#71879a]">{person.bio}</p>}
                            {person?.skills && (
                              <p className="mt-2 text-sm text-[#52677a]">
                                <strong>Skills:</strong> {person.skills}
                              </p>
                            )}
                            <p className="mt-2 whitespace-pre-line text-sm text-[#52677a]">
                              <strong>Cover note:</strong> {application.cover_note}
                            </p>
                            <p className="mt-2 text-xs text-[#8da0ae]">Applied {formatDate(application.created_at)}</p>

                            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                              <label className="sr-only" htmlFor={`status-${application.id}`}>
                                Application status
                              </label>
                              <select
                                id={`status-${application.id}`}
                                value={application.status}
                                disabled={busyId === application.id}
                                onChange={(event) =>
                                  updateStatus(job.id, application.id, event.target.value as ApplicationStatus)
                                }
                                className="min-h-11 w-full rounded-xl border border-[#c9d6e2] bg-white px-3 text-base text-[#102a43] sm:w-auto"
                              >
                                {STATUS_OPTIONS.map((value) => (
                                  <option key={value} value={value}>
                                    {statusLabels[value]}
                                  </option>
                                ))}
                              </select>
                              {person?.cv_path && (
                                <button
                                  onClick={() => viewCv(person.cv_path as string)}
                                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#c9d6e2] bg-white px-4 font-bold text-[#168057]"
                                >
                                  View CV
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </details>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
