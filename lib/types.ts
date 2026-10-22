export type Role = 'employee' | 'employer'
export type Profile = { id: string; full_name: string; role: Role; phone: string | null; location: string | null; bio: string | null; skills: string; cv_path: string | null }
export type Application = { id: string; job_id: string; employee_id: string; cover_note: string; status: 'submitted' | 'reviewing' | 'accepted' | 'rejected'; created_at: string }
export const applicationLabels = { submitted: 'Submitted', reviewing: 'In review', accepted: 'Accepted', rejected: 'Not selected' } as const
