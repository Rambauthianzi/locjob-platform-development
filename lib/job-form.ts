import type { JobRow } from '@/lib/jobs'

export const JOB_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Temporary', 'Freelance', 'Casual/Gig'] as const
export const PAY_FREQUENCIES = ['Per Day', 'Per Week', 'Per Month'] as const

export const JOB_LIMITS = { short: 100, long: 3000, minPay: 1, maxPay: 1_000_000 } as const

export type JobFormValues = {
  title: string
  company: string
  location: string
  category: string
  description: string
  requirements: string
  pay: string
  frequency: string
  workType: string
}

export type JobFormErrors = Partial<Record<keyof JobFormValues, string>>

// The columns we write to the jobs table (employer_id and status are set by the caller).
export type JobPayload = {
  title: string
  company: string
  location: string
  category: string
  description: string
  requirements: string
  payment_amount: number
  payment_frequency: string
  work_type: string
}

export const emptyJobForm: JobFormValues = {
  title: '',
  company: '',
  location: '',
  category: '',
  description: '',
  requirements: '',
  pay: '',
  frequency: 'Per Month',
  workType: 'Part-Time',
}

export function jobToForm(row: JobRow): JobFormValues {
  return {
    title: row.title,
    company: row.company,
    location: row.location,
    category: row.category ?? '',
    description: row.description,
    requirements: row.requirements ?? '',
    pay: String(Number(row.payment_amount)),
    frequency: row.payment_frequency,
    workType: row.work_type,
  }
}

export function validateJobForm(values: JobFormValues) {
  const clean: JobFormValues = {
    ...values,
    title: values.title.trim(),
    company: values.company.trim(),
    location: values.location.trim(),
    category: values.category.trim(),
    description: values.description.trim(),
    requirements: values.requirements.trim(),
    pay: values.pay.trim(),
  }

  const errors: JobFormErrors = {}
  const { short, long, minPay, maxPay } = JOB_LIMITS

  const required: Array<[keyof JobFormValues, string, number]> = [
    ['title', 'Job title', short],
    ['company', 'Company', short],
    ['location', 'Location', short],
    ['description', 'Description', long],
  ]
  for (const [key, label, max] of required) {
    if (!clean[key]) errors[key] = `${label} is required.`
    else if (clean[key].length > max) errors[key] = `Use ${max} characters or fewer.`
  }
  if (clean.category.length > short) errors.category = `Use ${short} characters or fewer.`
  if (clean.requirements.length > long) errors.requirements = `Use ${long} characters or fewer.`

  const payment = Number(clean.pay)
  if (!clean.pay) errors.pay = 'Pay amount is required.'
  else if (!/^\d+(\.\d{1,2})?$/.test(clean.pay)) errors.pay = 'Enter a number with at most two decimals.'
  else if (payment < minPay || payment > maxPay) errors.pay = 'Enter an amount between R1 and R1,000,000.'

  if (!(PAY_FREQUENCIES as readonly string[]).includes(clean.frequency)) {
    errors.frequency = 'Choose how often the pay is given.'
  }
  if (!(JOB_TYPES as readonly string[]).includes(clean.workType)) {
    errors.workType = 'Choose a work type.'
  }

  return { errors, clean, payment }
}

export function toJobPayload(clean: JobFormValues, payment: number): JobPayload {
  return {
    title: clean.title,
    company: clean.company,
    location: clean.location,
    category: clean.category,
    description: clean.description,
    requirements: clean.requirements,
    payment_amount: payment,
    payment_frequency: clean.frequency,
    work_type: clean.workType,
  }
}
