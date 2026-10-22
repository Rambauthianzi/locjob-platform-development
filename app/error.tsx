'use client'

export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="grid min-h-dvh place-items-center bg-[#f7f9fb] px-5 text-center"><div><p className="font-bold text-[#20a36a]">Something went wrong</p><h1 className="mt-2 text-3xl font-bold text-[#0d3b66]">We could not load this page.</h1><button onClick={reset} className="mt-6 min-h-11 rounded-xl bg-[#0d3b66] px-5 py-3 font-bold text-white">Try again</button></div></main> }
