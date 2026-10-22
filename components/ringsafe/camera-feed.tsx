'use client'

import { useEffect, useState } from 'react'
import {
  BellRing,
  Eye,
  EyeOff,
  Moon,
  Package,
  ScanLine,
  UserCheck,
  Wifi,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SCENARIOS,
  DEVICE,
  type Scenario,
  type ScenarioId,
} from '@/lib/ringsafe-data'

const SCENARIO_ICONS: Record<ScenarioId, typeof Package> = {
  delivery: Package,
  night: Moon,
  resident: UserCheck,
}

function useClock() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function formatStamp(now: Date | null) {
  if (!now) return { date: '----/--/--', time: '--:--:--' }
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
  }
}

interface CameraFeedProps {
  scenario: Scenario
  analyzing: boolean
  ringing: boolean
  onSelectScenario: (id: ScenarioId) => void
}

export function CameraFeed({
  scenario,
  analyzing,
  ringing,
  onSelectScenario,
}: CameraFeedProps) {
  const [overlayOn, setOverlayOn] = useState(true)
  const stamp = formatStamp(useClock())

  return (
    <section
      aria-label="Doorstep camera simulator"
      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/30"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <ScanLine className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Doorstep Camera
            </h2>
            <p className="text-xs text-slate-400">
              {DEVICE.name} &middot; {DEVICE.model}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOverlayOn((v) => !v)}
          aria-pressed={overlayOn}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
            overlayOn
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15'
              : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:bg-slate-800',
          )}
        >
          {overlayOn ? (
            <Eye className="size-3.5" aria-hidden="true" />
          ) : (
            <EyeOff className="size-3.5" aria-hidden="true" />
          )}
          AI Overlay {overlayOn ? 'On' : 'Off'}
        </button>
      </div>

      <div className="p-3 sm:p-4">
        <div
          className="relative aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-slate-700/70"
          role="img"
          aria-label={`${scenario.label} camera snapshot. ${scenario.status}.`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={scenario.id}
            src={scenario.image || '/placeholder.svg'}
            alt=""
            className="absolute inset-0 size-full origin-top-left animate-in fade-in object-cover duration-500"
            style={{ transform: `scale(${scenario.imageScale})` }}
            draggable={false}
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.06)_0px,rgba(0,0,0,0.06)_1px,transparent_1px,transparent_3px)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/60"
          />

          {analyzing && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-full"
            >
              <div className="absolute inset-x-0 h-16 animate-[scan_1.2s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-cyan-400/25 to-transparent" />
            </div>
          )}

          {overlayOn &&
            !analyzing &&
            scenario.boxes.map((box, i) => {
              const green = box.tone === 'green'
              const labelBelow = i > 0
              return (
                <div
                  key={`${scenario.id}-${i}`}
                  className={cn(
                    'absolute animate-in fade-in zoom-in-95 rounded-sm border-2 duration-500',
                    green
                      ? 'border-emerald-400 bg-emerald-400/10 shadow-[0_0_18px_rgba(52,211,153,0.45)]'
                      : 'border-yellow-300 bg-yellow-300/10 shadow-[0_0_18px_rgba(253,224,71,0.4)]',
                  )}
                  style={{
                    top: `${box.top}%`,
                    left: `${box.left}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                  }}
                >
                  <div
                    className={cn(
                      'absolute left-[-2px] flex w-max items-center gap-1.5 whitespace-nowrap rounded-sm px-1.5 py-0.5 text-[10px] font-semibold leading-tight text-slate-950 sm:text-xs',
                      labelBelow ? 'top-full mt-1' : 'bottom-full mb-0.5',
                      green ? 'bg-emerald-400' : 'bg-yellow-300',
                    )}
                  >
                    <span>{box.label}</span>
                    {box.detail && (
                      <span className="hidden font-medium opacity-75 sm:inline">
                        {box.detail}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}

          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-[11px] font-bold tracking-wider text-white backdrop-blur">
              <span
                aria-hidden="true"
                className="size-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]"
              />
              REC
            </span>
            <span className="hidden rounded-md bg-black/60 px-2 py-1 font-mono text-[11px] text-slate-200 backdrop-blur sm:inline">
              1080p &middot; 30fps
            </span>
            {scenario.nightVision && (
              <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[11px] text-lime-300 backdrop-blur">
                <Moon className="size-3" aria-hidden="true" />
                <span className="hidden sm:inline">IR Night Vision</span>
              </span>
            )}
          </div>

          <div className="absolute right-3 top-3 flex items-center gap-2 rounded-md bg-black/60 px-2 py-1 text-[11px] text-slate-200 backdrop-blur">
            <Wifi className="size-3 text-emerald-400" aria-hidden="true" />
            <span>{DEVICE.name}</span>
          </div>

          {ringing && (
            <div
              role="status"
              className="absolute bottom-12 left-1/2 flex -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 items-center gap-2 rounded-full border border-cyan-300/50 bg-cyan-500/90 px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 duration-300"
            >
              <BellRing
                className="size-4 animate-[wiggle_0.6s_ease-in-out_infinite]"
                aria-hidden="true"
              />
              Doorbell ringing
            </div>
          )}

          {analyzing && (
            <div
              role="status"
              className="absolute bottom-12 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-cyan-300 backdrop-blur"
            >
              Analyzing frame&hellip;
            </div>
          )}

          <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 font-mono text-[11px] leading-tight text-white backdrop-blur sm:text-xs">
            <span className="text-slate-300">{stamp.date}</span>{' '}
            <span className="font-semibold">{stamp.time}</span>
          </div>
          <div className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 font-mono text-[11px] text-slate-300 backdrop-blur sm:text-xs">
            CAM-01 &middot; {scenario.zone}
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Simulation scenarios"
          className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3"
        >
          {SCENARIOS.map((s) => {
            const Icon = SCENARIO_ICONS[s.id]
            const active = s.id === scenario.id
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelectScenario(s.id)}
                className={cn(
                  'group flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                  active
                    ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.12)]'
                    : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800',
                )}
              >
                <Icon
                  className={cn(
                    'size-4',
                    active ? 'text-cyan-300' : 'text-slate-400',
                  )}
                  aria-hidden="true"
                />
                {s.label}
              </button>
            )
          })}
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {scenario.metadata.map((m) => (
            <div
              key={m.label}
              className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
            >
              <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                {m.label}
              </dt>
              <dd className="mt-0.5 truncate text-sm font-medium text-slate-200">
                {m.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
