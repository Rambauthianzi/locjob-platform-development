import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Your dashboard' }
export default function Layout({ children }: { children: React.ReactNode }) { return children }
