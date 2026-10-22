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

export function formatPay(amount: number, frequency: JobRow['payment_frequency']) {
  return `R${amount.toLocaleString('en-ZA')} / ${frequency.replace('Per ', '').toLowerCase()}`
}

export function mapJob(row: JobRow): Job {
  return { ...row, pay: formatPay(Number(row.payment_amount), row.payment_frequency) }
}

export const workTypes = ['All types', 'Full-Time', 'Part-Time', 'Contract', 'Temporary', 'Freelance', 'Casual/Gig'] as const
