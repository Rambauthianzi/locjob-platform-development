import Link from 'next/link'

export default function LoginPage() {
  return <main className="min-h-screen bg-[#f7f9fb] px-5 py-12 text-[#102a43]"><div className="mx-auto max-w-md rounded-3xl border border-[#dce6ee] bg-white p-7 shadow-sm"><Link href="/" className="text-xl font-bold text-[#0d3b66]">Loc<span className="text-[#20a36a]">Job</span></Link><h1 className="mt-8 text-3xl font-bold text-[#0d3b66]">Welcome back</h1><p className="mt-2 text-sm text-[#71879a]">Sign in securely with Auth0 to continue your local work journey.</p><a href="/auth/login?returnTo=/dashboard" className="mt-7 block rounded-xl bg-[#0d3b66] px-4 py-3 text-center font-bold text-white transition hover:bg-[#082b4b]">Continue to sign in</a><p className="mt-6 text-center text-sm text-[#71879a]">New to LocJob? <Link href="/signup" className="font-bold text-[#168057]">Create an account</Link></p></div></main>
}
