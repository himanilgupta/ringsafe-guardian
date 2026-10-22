'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_SCENARIO,
  buildDingEvent,
  buildScenarioEvents,
  getScenario,
  type ScenarioId,
  type WebhookEvent,
} from '@/lib/ringsafe-data'
import { AuditTrail, type AuditEntry } from './audit-trail'
import { CameraFeed } from './camera-feed'
import { Header } from './header'
import { VerificationCard, type Decision } from './verification-card'
import { WebhookLog } from './webhook-log'

const ANALYZE_MS = 1300
const FIRST_EVENT_MS = 500
const EVENT_GAP_MS = 1100
const MAX_EVENTS = 60
const MAX_AUDIT = 20

function clock(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function Dashboard() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>(DEFAULT_SCENARIO)
  const [analyzing, setAnalyzing] = useState(true)
  const [streaming, setStreaming] = useState(false)
  const [ringing, setRinging] = useState(false)
  const [decision, setDecision] = useState<Decision>(null)
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [audit, setAudit] = useState<AuditEntry[]>([])

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const ringTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const auditSeq = useRef(0)
  const dingSeq = useRef(0)

  const scenario = getScenario(scenarioId)

  const pushAudit = useCallback((entry: Omit<AuditEntry, 'id' | 'time'>) => {
    auditSeq.current += 1
    setAudit((prev) =>
      [
        { ...entry, id: `a${auditSeq.current}`, time: clock() },
        ...prev,
      ].slice(0, MAX_AUDIT),
    )
  }, [])

  const ring = useCallback(() => {
    setRinging(true)
    if (ringTimer.current) clearTimeout(ringTimer.current)
    ringTimer.current = setTimeout(() => setRinging(false), 4000)
  }, [])

  const appendEvent = useCallback((e: WebhookEvent) => {
    setEvents((prev) => [...prev, e].slice(-MAX_EVENTS))
  }, [])

  const runScenario = useCallback(
    (id: ScenarioId) => {
      timers.current.forEach(clearTimeout)
      timers.current = []

      const next = getScenario(id)
      const startedAt = Date.now()
      const sequence = buildScenarioEvents(id, startedAt)

      setScenarioId(id)
      setAnalyzing(true)
      setStreaming(true)
      setDecision(null)
      setEvents([])

      sequence.forEach((e, i) => {
        timers.current.push(
          setTimeout(
            () => {
              appendEvent(e)
              if (e.type === 'ring.doorbell_ding') ring()
            },
            FIRST_EVENT_MS + i * EVENT_GAP_MS,
          ),
        )
      })

      timers.current.push(
        setTimeout(() => {
          setAnalyzing(false)
          pushAudit({
            title: next.status,
            detail: `${next.confidence}% confidence - ${next.risk} risk`,
            kind: next.tone === 'verified' ? 'verified' : 'alert',
          })
        }, ANALYZE_MS),
      )

      timers.current.push(
        setTimeout(
          () => setStreaming(false),
          FIRST_EVENT_MS + sequence.length * EVENT_GAP_MS,
        ),
      )
    },
    [appendEvent, pushAudit, ring],
  )

  useEffect(() => {
    runScenario(DEFAULT_SCENARIO)
    return () => {
      timers.current.forEach(clearTimeout)
      if (ringTimer.current) clearTimeout(ringTimer.current)
    }
  }, [runScenario])

  const simulateDing = useCallback(() => {
    dingSeq.current += 1
    appendEvent(buildDingEvent(scenarioId, Date.now(), dingSeq.current))
    ring()
    pushAudit({
      title: 'Doorbell pressed',
      detail: `Front Door - ring.doorbell_ding sent to RingSafe`,
      kind: 'ding',
    })
  }, [appendEvent, pushAudit, ring, scenarioId])

  const handleDecision = useCallback(
    (d: Exclude<Decision, null>) => {
      setDecision(d)
      pushAudit(
        d === 'approved'
          ? {
              title: `${scenario.action} executed`,
              detail: 'Approved from the RingSafe dashboard',
              kind: scenario.tone === 'verified' ? 'verified' : 'alert',
            }
          : {
              title: 'Recommended action dismissed',
              detail: `${scenario.action} was not applied`,
              kind: 'denied',
            },
      )
    },
    [pushAudit, scenario],
  )

  const handleUndo = useCallback(() => {
    setDecision(null)
    pushAudit({
      title: 'Decision reverted',
      detail: 'Awaiting a new decision',
      kind: 'denied',
    })
  }, [pushAudit])

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(60rem_30rem_at_50%_-10%,rgba(34,211,238,0.08),transparent)] text-slate-100">
      <Header onSimulateDing={simulateDing} />
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            <CameraFeed
              scenario={scenario}
              analyzing={analyzing}
              ringing={ringing}
              onSelectScenario={runScenario}
            />
            <AuditTrail entries={audit} />
          </div>
          <div className="space-y-5">
            <VerificationCard
              scenario={scenario}
              analyzing={analyzing}
              decision={decision}
              onDecision={handleDecision}
              onUndo={handleUndo}
            />
            <WebhookLog
              events={events}
              streaming={streaming}
              onClear={() => setEvents([])}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
