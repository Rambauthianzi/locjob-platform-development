import Link from 'next/link'

export function TrustPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="page-fade min-h-dvh bg-[#f7f9fb] px-5 py-12 text-[#102a43]">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#dce6ee] bg-white p-6 shadow-sm sm:p-7">
        <Link href="/" className="text-xl font-bold text-[#0d3b66]">
          Loc<span className="text-[#20a36a]">Job</span>
        </Link>
        <h1 className="mt-8 text-balance text-3xl font-bold text-[#0d3b66] sm:text-4xl">{title}</h1>
        <p className="mt-3 rounded-xl bg-[#eef6f3] p-3 text-sm font-semibold text-[#168057]">
          Draft - to be reviewed by a legal professional before launch
        </p>
        <div className="mt-8 space-y-5 leading-7 text-[#52677a]">{children}</div>
      </div>
    </main>
  )
}
