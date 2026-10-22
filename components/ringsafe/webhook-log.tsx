'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  ChevronDown,
  Copy,
  Terminal,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WebhookEvent, WebhookEventType } from '@/lib/ringsafe-data'

type Filter = 'all' | WebhookEventType

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'device.motion_detected', label: 'motion' },
  { id: 'package.detected', label: 'package' },
  { id: 'ring.doorbell_ding', label: 'ding' },
]

const TYPE_COLOR: Record<WebhookEventType, string> = {
  'device.motion_detected': 'text-yellow-300',
  'package.detected': 'text-emerald-300',
  'ring.doorbell_ding': 'text-cyan-300',
}

const TOKEN_RE =
  /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g

function highlightJson(json: string) {
  const nodes: React.ReactNode[] = []
  let last = 0
  let i = 0
  for (const m of json.matchAll(TOKEN_RE)) {
    const idx = m.index ?? 0
    if (idx > last) nodes.push(json.slice(last, idx))
    if (m[1] !== undefined) {
      if (m[2]) {
        nodes.push(
          <span key={i++} className="text-sky-300">
            {m[1]}
          </span>,
          m[2],
        )
      } else {
        nodes.push(
          <span key={i++} className="text-emerald-300">
            {m[1]}
          </span>,
        )
      }
    } else if (m[3] !== undefined) {
      nodes.push(
        <span key={i++} className="text-fuchsia-300">
          {m[3]}
        </span>,
      )
    } else {
      nodes.push(
        <span key={i++} className="text-amber-300">
          {m[4]}
        </span>,
      )
    }
    last = idx + m[0].length
  }
  if (last < json.length) nodes.push(json.slice(last))
  return nodes
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  }
}

function formatTime(iso: string) {
  return iso.slice(11, 23)
}

interface WebhookLogProps {
  events: WebhookEvent[]
  streaming: boolean
  onClear: () => void
}

export function WebhookLog({ events, streaming, onClear }: WebhookLogProps) {
  const [open, setOpen] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [copied, setCopied] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  const visible = useMemo(
    () => (filter === 'all' ? events : events.filter((e) => e.type === filter)),
    [events, filter],
  )

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: events.length,
      'device.motion_detected': 0,
      'package.detected': 0,
      'ring.doorbell_ding': 0,
    }
    for (const e of events) c[e.type]++
    return c
  }, [events])

  useEffect(() => {
    const el = scrollRef.current
    const newest = el?.querySelector<HTMLElement>('li:last-child')
    if (el && newest) {
      el.scrollTo({ top: Math.max(0, newest.offsetTop - 12), behavior: 'smooth' })
    }
  }, [visible.length])

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(t)
  }, [copied])

  const handleCopy = async () => {
    if (visible.length === 0) return
    const body = visible.map((e) => e.payload)
    const ok = await copyText(JSON.stringify(body.length === 1 ? body[0] : body, null, 2))
    setCopied(ok)
  }

  return (
    <section
      aria-label="Ring webhook log"
      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/30"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="webhook-terminal"
          className="-m-1 flex items-center gap-2.5 rounded-lg p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <Terminal className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
              Ring Webhook Log
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                  streaming
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'bg-slate-800 text-slate-400',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'size-1.5 rounded-full',
                    streaming ? 'animate-pulse bg-emerald-400' : 'bg-slate-500',
                  )}
                />
                {streaming ? 'Live' : 'Idle'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              POST /webhooks/ring &middot; {events.length} event
              {events.length === 1 ? '' : 's'}
            </p>
          </div>
          <ChevronDown
            className={cn(
              'ml-1 size-4 text-slate-400 transition-transform duration-200',
              !open && '-rotate-90',
            )}
            aria-hidden="true"
          />
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onClear}
            disabled={events.length === 0}
            aria-label="Clear log"
            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={visible.length === 0}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-40',
              copied
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                : 'border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-800',
            )}
          >
            {copied ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
            <span aria-live="polite">{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
        </div>
      </div>

      <div
        id="webhook-terminal"
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div
            role="tablist"
            aria-label="Filter webhook events"
            className="flex gap-1 overflow-x-auto border-b border-slate-800 px-3 py-2"
          >
            {FILTERS.map((f) => {
              const active = filter === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  tabIndex={open ? 0 : -1}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                    active
                      ? 'bg-cyan-500/15 text-cyan-200'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
                  )}
                >
                  {f.label}
                  <span
                    className={cn(
                      'rounded px-1 text-[10px] tabular-nums',
                      active ? 'bg-cyan-400/20' : 'bg-slate-800',
                    )}
                  >
                    {counts[f.id]}
                  </span>
                </button>
              )
            })}
          </div>

          <div
            ref={scrollRef}
            tabIndex={open ? 0 : -1}
            aria-label="Webhook payloads"
            className="relative max-h-[360px] min-h-[200px] overflow-auto bg-slate-950 p-3 font-[family-name:var(--font-geist-mono)] text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400"
          >
            {visible.length === 0 ? (
              <p className="py-6 text-center text-slate-500">
                <span className="text-emerald-400">$</span> waiting for Ring
                events
                <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-slate-400" />
              </p>
            ) : (
              <ul className="space-y-3">
                {visible.map((e) => {
                  const isCollapsed = collapsed[e.id]
                  return (
                    <li
                      key={e.id}
                      className="animate-in fade-in slide-in-from-bottom-1 duration-300"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setCollapsed((c) => ({ ...c, [e.id]: !c[e.id] }))
                        }
                        aria-expanded={!isCollapsed}
                        className="flex w-full items-center gap-2 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                      >
                        <ChevronDown
                          className={cn(
                            'size-3 shrink-0 text-slate-500 transition-transform',
                            isCollapsed && '-rotate-90',
                          )}
                          aria-hidden="true"
                        />
                        <span className="text-slate-500">
                          {formatTime(e.payload.timestamp as string)}
                        </span>
                        <span className={cn('font-semibold', TYPE_COLOR[e.type])}>
                          {e.type}
                        </span>
                        <span className="ml-auto rounded bg-emerald-500/15 px-1.5 text-[10px] font-semibold text-emerald-300">
                          200 OK
                        </span>
                      </button>
                      {!isCollapsed && (
                        <pre className="mt-1.5 overflow-x-auto border-l border-slate-800 pl-4 text-slate-300">
                          {highlightJson(JSON.stringify(e.payload, null, 2))}
                        </pre>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
