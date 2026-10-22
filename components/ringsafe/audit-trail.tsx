import { BellRing, CheckCircle2, ScrollText, ShieldAlert, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AuditEntry {
  id: string
  time: string
  title: string
  detail: string
  kind: 'verified' | 'alert' | 'ding' | 'denied'
}

const KIND = {
  verified: { icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10' },
  alert: { icon: ShieldAlert, color: 'text-red-400 bg-red-500/10' },
  ding: { icon: BellRing, color: 'text-cyan-300 bg-cyan-500/10' },
  denied: { icon: XCircle, color: 'text-slate-400 bg-slate-700/40' },
} as const

export function AuditTrail({ entries }: { entries: AuditEntry[] }) {
  return (
    <section
      aria-label="Audit trail"
      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/30"
    >
      <div className="flex items-center gap-2.5 border-b border-slate-800 px-4 py-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
          <ScrollText className="size-4" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Audit Trail</h2>
          <p className="text-xs text-slate-400">
            Every decision RingSafe makes, in order
          </p>
        </div>
      </div>
      <ol className="max-h-56 divide-y divide-slate-800/70 overflow-y-auto">
        {entries.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-slate-500">
            No activity yet
          </li>
        )}
        {entries.map((e) => {
          const { icon: Icon, color } = KIND[e.kind]
          return (
            <li
              key={e.id}
              className="flex animate-in fade-in items-start gap-3 px-4 py-2.5 duration-300"
            >
              <span
                className={cn(
                  'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full',
                  color,
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-200">
                  {e.title}
                </p>
                <p className="truncate text-xs text-slate-500">{e.detail}</p>
              </div>
              <time className="shrink-0 font-mono text-[11px] text-slate-500">
                {e.time}
              </time>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
