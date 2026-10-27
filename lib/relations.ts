// Supabase returns a joined row as an object or as a one-item array depending on
// the relationship. This normalises both shapes to a single row (or null).
export function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium' }).format(new Date(value))
}
