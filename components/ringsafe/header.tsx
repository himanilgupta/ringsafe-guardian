import { BellRing, ShieldCheck } from 'lucide-react'

export function Header({ onSimulateDing }: { onSimulateDing: () => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="size-5" strokeWidth={2.5} aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <h1 className="text-lg font-bold tracking-tight text-slate-50">
              Ring<span className="text-cyan-400">Safe</span>
            </h1>
            <p className="text-xs text-slate-400">Smart Doorstep Guardian</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            Ring Developer Playground: Connected
          </div>
          <button
            type="button"
            onClick={onSimulateDing}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-3.5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition-colors hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:translate-y-px"
          >
            <BellRing className="size-4" aria-hidden="true" />
            Simulate Ring Ding
          </button>
        </div>
      </div>
    </header>
  )
}
