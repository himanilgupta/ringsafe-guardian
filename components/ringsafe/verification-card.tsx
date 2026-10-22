'use client'

import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Loader2,
  LockOpen,
  ShieldAlert,
  ShieldCheck,
  Undo2,
  XCircle,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Scenario } from '@/lib/ringsafe-data'

export type Decision = 'approved' | 'denied' | null

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) {
      setValue(0)
      return
    }
    const duration = 900
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, active])
  return value
}

const TONE = {
  verified: {
    stroke: 'stroke-emerald-400',
    text: 'text-emerald-300',
    soft: 'border-emerald-500/30 bg-emerald-500/10',
    solid: 'bg-emerald-500 text-slate-950 hover:bg-emerald-400',
  },
  warning: {
    stroke: 'stroke-yellow-300',
    text: 'text-yellow-200',
    soft: 'border-yellow-400/30 bg-yellow-400/10',
    solid: 'bg-yellow-400 text-slate-950 hover:bg-yellow-300',
  },
  alert: {
    stroke: 'stroke-red-400',
    text: 'text-red-300',
    soft: 'border-red-500/30 bg-red-500/10',
    solid: 'bg-red-500 text-white hover:bg-red-400',
  },
} as const

function Gauge({
  value,
  toneClass,
  analyzing,
}: {
  value: number
  toneClass: string
  analyzing: boolean
}) {
  const radius = 44
  const circumference = 2 * Math.PI * radius
  return (
    <div className="relative size-28 shrink-0 sm:size-32">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          className="stroke-slate-800"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
          className={cn(toneClass, 'transition-[stroke] duration-500')}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {analyzing ? (
          <Loader2
            className="size-6 animate-spin text-cyan-300"
            aria-label="Analyzing"
          />
        ) : (
          <>
            <span className="text-3xl font-bold tabular-nums text-slate-50">
              {value}
              <span className="text-lg text-slate-400">%</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Confidence
            </span>
          </>
        )}
      </div>
    </div>
  )
}

interface VerificationCardProps {
  scenario: Scenario
  analyzing: boolean
  decision: Decision
  onDecision: (d: Exclude<Decision, null>) => void
  onUndo: () => void
}

export function VerificationCard({
  scenario,
  analyzing,
  decision,
  onDecision,
  onUndo,
}: VerificationCardProps) {
  const tone = TONE[scenario.tone]
  const confidence = useCountUp(scenario.confidence, !analyzing)
  const StatusIcon = scenario.tone === 'verified' ? ShieldCheck : ShieldAlert
  const ActionIcon = scenario.id === 'resident' ? LockOpen : Zap

  return (
    <section
      aria-label="Verification result"
      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/30"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </div>
          <h2 className="text-sm font-semibold text-slate-100">
            Verification
          </h2>
        </div>
        <span
          className={cn(
            'rounded-full border px-2.5 py-0.5 text-xs font-semibold',
            analyzing
              ? 'border-slate-700 bg-slate-800 text-slate-400'
              : cn(tone.soft, tone.text),
          )}
        >
          {analyzing ? 'Analyzing' : `${scenario.risk} risk`}
        </span>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center gap-4">
          <Gauge
            value={confidence}
            toneClass={tone.stroke}
            analyzing={analyzing}
          />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Status
            </p>
            {analyzing ? (
              <div className="mt-1 space-y-2" aria-hidden="true">
                <div className="h-4 w-4/5 animate-pulse rounded bg-slate-800" />
                <div className="h-3 w-full animate-pulse rounded bg-slate-800/70" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-slate-800/70" />
              </div>
            ) : (
              <>
                <p
                  className={cn(
                    'mt-0.5 flex items-start gap-1.5 text-base font-semibold leading-snug text-pretty',
                    tone.text,
                  )}
                >
                  <StatusIcon
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  {scenario.status}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400 text-pretty">
                  {scenario.statusDetail}
                </p>
              </>
            )}
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {scenario.signals.map((s) => (
            <li
              key={s.label}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-2"
            >
              {analyzing ? (
                <span className="size-4 shrink-0 animate-pulse rounded-full bg-slate-800" />
              ) : s.pass ? (
                <CheckCircle2
                  className="size-4 shrink-0 text-emerald-400"
                  aria-label="Passed"
                />
              ) : (
                <XCircle
                  className="size-4 shrink-0 text-red-400"
                  aria-label="Failed"
                />
              )}
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-300">
                  {s.label}
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  {analyzing ? 'Checking\u2026' : s.value}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div
          className={cn(
            'rounded-xl border p-3.5',
            analyzing ? 'border-slate-800 bg-slate-950/60' : tone.soft,
          )}
        >
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Recommended automated action
          </p>
          <p className="mt-1 flex items-center gap-2 text-base font-semibold text-slate-50">
            <ActionIcon
              className={cn('size-4', analyzing ? 'text-slate-500' : tone.text)}
              aria-hidden="true"
            />
            {analyzing ? 'Evaluating policy\u2026' : scenario.action}
          </p>
          {!analyzing && (
            <p className="mt-1 text-xs leading-relaxed text-slate-400 text-pretty">
              {scenario.actionDetail}
            </p>
          )}

          <div className="mt-3">
            {decision ? (
              <div
                role="status"
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                  {decision === 'approved' ? (
                    <CheckCircle2
                      className="size-4 text-emerald-400"
                      aria-hidden="true"
                    />
                  ) : (
                    <XCircle
                      className="size-4 text-slate-400"
                      aria-hidden="true"
                    />
                  )}
                  {decision === 'approved'
                    ? `${scenario.action} executed`
                    : 'Action dismissed'}
                </span>
                <button
                  type="button"
                  onClick={onUndo}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <Undo2 className="size-3.5" aria-hidden="true" />
                  Undo
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={analyzing}
                  onClick={() => onDecision('approved')}
                  className={cn(
                    'inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-40',
                    tone.solid,
                  )}
                >
                  <ActionIcon className="size-4" aria-hidden="true" />
                  {scenario.approveLabel}
                </button>
                <button
                  type="button"
                  disabled={analyzing}
                  onClick={() => onDecision('denied')}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {scenario.denyLabel}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
