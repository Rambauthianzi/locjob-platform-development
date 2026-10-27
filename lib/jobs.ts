export type JobRow = {
  id: string
  employer_id: string
  title: string
  company: string
  description: string
  location: string
  requirements: string | null
  payment_amount: number
  payment_frequency: 'Per Day' | 'Per Week' | 'Per Month'
  work_type: 'Full-Time' | 'Part-Time' | 'Contract' | 'Temporary' | 'Freelance' | 'Casual/Gig'
  category: string
  status: 'published' | 'closed'
  created_at?: string
}

export type Job = JobRow & { pay: string }

export const JOB_COLUMNS =
  'id,employer_id,title,company,description,location,requirements,payment_amount,payment_frequency,work_type,category,status,created_at'

export function formatPay(amount: number, frequency: JobRow['payment_frequency']) {
  return `R${amount.toLocaleString('en-ZA')} / ${frequency.replace('Per ', '').toLowerCase()}`
}

export function mapJob(row: JobRow): Job {
  return { ...row, pay: formatPay(Number(row.payment_amount), row.payment_frequency) }
}

export function postedLabel(date?: string) {
  if (!date) return 'Posted recently'
  const days = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000))
  if (days === 0) return 'Posted today'
  return `Posted ${days} day${days === 1 ? '' : 's'} ago`
}

export const workTypes = ['All types', 'Full-Time', 'Part-Time', 'Contract', 'Temporary', 'Freelance', 'Casual/Gig'] as const
