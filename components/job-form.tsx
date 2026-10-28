'use client'

import { ChangeEvent, FormEvent, ReactNode, useState } from 'react'
import {
  formControlClass,
  formLabelClass,
  formSelectClass,
  primaryButtonClass,
} from '@/lib/form-styles'
import {
  JOB_LIMITS,
  JOB_TYPES,
  PAY_FREQUENCIES,
  toJobPayload,
  validateJobForm,
  type JobFormErrors,
  type JobFormValues,
  type JobPayload,
} from '@/lib/job-form'

type JobFormProps = {
  initial: JobFormValues
  submitLabel: string
  busyLabel: string
  // Returns an error message to show, or null when the save worked.
  onSubmit: (payload: JobPayload) => Promise<string | null>
}

type FieldProps = {
  name: keyof JobFormValues
  label: string
  hint?: string
  error?: string
  className?: string
  children: ReactNode
}

function Field({ name, label, hint, error, className = '', children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={`job-${name}`} className={formLabelClass}>
        {label}
        {hint && <span className="ml-1 font-normal text-[#71879a]">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`job-${name}-error`} className="mt-1 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export function JobForm({ initial, submitLabel, busyLabel, onSubmit }: JobFormProps) {
  const [form, setForm] = useState<JobFormValues>(initial)
  const [errors, setErrors] = useState<JobFormErrors>({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  function update(name: keyof JobFormValues, value: string) {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current))
  }

  // Props shared by every input, textarea and select.
  function field(name: keyof JobFormValues) {
    return {
      id: `job-${name}`,
      name,
      value: form[name],
      'aria-invalid': errors[name] ? true : undefined,
      'aria-describedby': errors[name] ? `job-${name}-error` : undefined,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        update(name, event.target.value),
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (saving) return
    setFormError('')

    const { errors: found, clean, payment } = validateJobForm(form)
    setForm(clean)
    setErrors(found)

    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      document.getElementById(`job-${firstInvalid}`)?.focus()
      return
    }

    setSaving(true)
    try {
      const message = await onSubmit(toJobPayload(clean, payment))
      if (message) setFormError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="mt-6 grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="title" label="Job title" error={errors.title}>
          <input {...field('title')} maxLength={JOB_LIMITS.short} className={formControlClass} />
        </Field>
        <Field name="company" label="Company" error={errors.company}>
          <input {...field('company')} maxLength={JOB_LIMITS.short} className={formControlClass} />
        </Field>
        <Field name="location" label="Location" error={errors.location}>
          <input {...field('location')} maxLength={JOB_LIMITS.short} className={formControlClass} />
        </Field>
        <Field name="category" label="Category" hint="(optional)" error={errors.category}>
          <input {...field('category')} maxLength={JOB_LIMITS.short} className={formControlClass} />
        </Field>
      </div>

      <Field name="description" label="Description" error={errors.description}>
        <textarea
          {...field('description')}
          maxLength={JOB_LIMITS.long}
          rows={6}
          className={`${formControlClass} min-h-36`}
        />
        <span className="mt-1 block text-right text-xs text-[#71879a]">
          {form.description.length}/{JOB_LIMITS.long}
        </span>
      </Field>

      <Field name="requirements" label="Requirements" hint="(optional)" error={errors.requirements}>
        <textarea
          {...field('requirements')}
          maxLength={JOB_LIMITS.long}
          rows={4}
          className={`${formControlClass} min-h-28`}
        />
        <span className="mt-1 block text-right text-xs text-[#71879a]">
          {form.requirements.length}/{JOB_LIMITS.long}
        </span>
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field name="pay" label="Pay amount (R)" error={errors.pay}>
          <input
            {...field('pay')}
            type="number"
            inputMode="decimal"
            min={JOB_LIMITS.minPay}
            max={JOB_LIMITS.maxPay}
            step="0.01"
            className={formControlClass}
          />
        </Field>
        <Field name="frequency" label="Payment frequency" error={errors.frequency}>
          <select {...field('frequency')} className={formSelectClass}>
            {PAY_FREQUENCIES.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </Field>
        <Field name="workType" label="Work type" error={errors.workType}>
          <select {...field('workType')} className={formSelectClass}>
            {JOB_TYPES.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </Field>
      </div>

      {formError && (
        <p key={formError} role="alert" className="animate-shake text-sm font-semibold text-red-600">
          {formError}
        </p>
      )}

      <button disabled={saving} className={`${primaryButtonClass} w-full sm:w-auto`}>
        {saving ? busyLabel : submitLabel}
      </button>
    </form>
  )
}
