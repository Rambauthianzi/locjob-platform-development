import { Analytics } from '@vercel/analytics/next'
import { Auth0Provider } from '@auth0/nextjs-auth0/client'
import { auth0 } from '@/lib/auth0'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LocJob — Local Opportunities. Real Experience.',
  description: 'Find local jobs, part-time work, freelance gigs, and entry-level opportunities near you.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f9fb' },
    { media: '(prefers-color-scheme: dark)', color: '#0d3b66' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth0.getSession()

  return (
    <html lang="en">
      <body className="antialiased">
        <Auth0Provider user={session?.user}>{children}</Auth0Provider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
