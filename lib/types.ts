export type Profile = { id: string; full_name: string; role: 'employee' | 'employer'; phone: string | null; location: string | null; bio: string | null; skills: string; cv_path: string | null }
export type ApplicationStatus = 'submitted' | 'reviewing' | 'accepted' | 'rejected'
export type Application = { id: string; job_id: string; employee_id: string; cover_note: string; status: ApplicationStatus; created_at: string }
export const statusLabels: Record<ApplicationStatus, string> = { submitted: 'Submitted', reviewing: 'In review', accepted: 'Accepted', rejected: 'Not selected' }
export const statusClasses: Record<ApplicationStatus, string> = { submitted: 'bg-[#e7eef5] text-[#38536b]', reviewing: 'bg-[#fff0c7] text-[#765b13]', accepted: 'bg-[#e2f6eb] text-[#168057]', rejected: 'bg-[#f5e4e5] text-[#8a454b]' }
