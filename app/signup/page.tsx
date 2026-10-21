import Link from 'next/link'

export default function SignupPage() {
  return <main className="min-h-screen bg-[#f7f9fb] px-5 py-12 text-[#102a43]"><div className="mx-auto max-w-md rounded-3xl border border-[#dce6ee] bg-white p-7 shadow-sm"><Link href="/" className="text-xl font-bold text-[#0d3b66]">Loc<span className="text-[#20a36a]">Job</span></Link><h1 className="mt-8 text-3xl font-bold text-[#0d3b66]">Create your account</h1><p className="mt-2 text-sm text-[#71879a]">Use Auth0&apos;s secure sign-up to join LocJob.</p><a href="/auth/login?screen_hint=signup&returnTo=/dashboard" className="mt-7 block rounded-xl bg-[#20a36a] px-4 py-3 text-center font-bold text-white transition hover:bg-[#168057]">Continue to sign up</a><p className="mt-6 text-center text-sm text-[#71879a]">Already have an account? <Link href="/login" className="font-bold text-[#168057]">Sign in</Link></p></div></main>
}
