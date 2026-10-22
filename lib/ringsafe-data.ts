export type ScenarioId = 'delivery' | 'night' | 'resident'

export type Tone = 'verified' | 'warning' | 'alert'

export type WebhookEventType =
  | 'device.motion_detected'
  | 'package.detected'
  | 'ring.doorbell_ding'

export interface WebhookEvent {
  id: string
  type: WebhookEventType
  payload: Record<string, unknown>
}

export interface BoundingBox {
  label: string
  detail: string
  tone: 'green' | 'yellow'
  /** Percentages of the rendered feed */
  top: number
  left: number
  width: number
  height: number
}

export interface Signal {
  label: string
  value: string
  pass: boolean
}

export interface Scenario {
  id: ScenarioId
  label: string
  shortLabel: string
  image: string
  /** Zoom applied to the snapshot (anchored top-left) to crop the camera's baked-in overlay */
  imageScale: number
  tone: Tone
  confidence: number
  status: string
  statusDetail: string
  risk: 'Low' | 'Elevated' | 'High'
  action: string
  actionDetail: string
  approveLabel: string
  denyLabel: string
  detectedClass: string
  zone: string
  nightVision: boolean
  boxes: BoundingBox[]
  signals: Signal[]
  metadata: { label: string; value: string }[]
}

export const DEVICE = {
  id: 'rng_dbl_7f3a91c2',
  name: 'Front Door',
  model: 'Ring Video Doorbell Pro 2',
  location_id: 'loc_a41b77d0',
  firmware: '3.4.18',
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'delivery',
    label: 'Package Delivery',
    shortLabel: 'Delivery',
    image: '/scenes/package-delivery.png',
    imageScale: 1,
    tone: 'verified',
    confidence: 94,
    status: 'Verified Carrier - Amazon Logistics',
    statusDetail: 'Uniform, lanyard badge and parcel label match an active delivery route.',
    risk: 'Low',
    action: 'Auto-Grant Porch Access',
    actionDetail: 'Hold the porch light on for 2 minutes and notify the owner when the parcel is dropped.',
    approveLabel: 'Grant Porch Access',
    denyLabel: 'Deny',
    detectedClass: 'Person + Parcel',
    zone: 'Porch / Zone A',
    nightVision: false,
    boxes: [
      {
        label: 'AI Badge Verification',
        detail: 'Amazon DSP - ID ****4821',
        tone: 'green',
        top: 24,
        left: 34.5,
        width: 18.5,
        height: 68,
      },
      {
        label: 'Parcel 1Z-AMZ-7731',
        detail: 'Size M',
        tone: 'yellow',
        top: 45,
        left: 37,
        width: 10.5,
        height: 17,
      },
    ],
    signals: [
      { label: 'Uniform match', value: 'Amazon Logistics navy', pass: true },
      { label: 'Badge OCR', value: 'DSP-4821 / valid', pass: true },
      { label: 'Manifest cross-check', value: 'Order #113-4829105', pass: true },
      { label: 'Dwell time', value: '14s (normal)', pass: true },
    ],
    metadata: [
      { label: 'Detected', value: 'Person + Parcel' },
      { label: 'Zone', value: 'Porch / Zone A' },
      { label: 'Carrier', value: 'Amazon Logistics' },
      { label: 'Route', value: 'DSP-4821 / Stop 37' },
    ],
  },
  {
    id: 'night',
    label: 'Night Visitor',
    shortLabel: 'Night',
    image: '/scenes/night-visitor.png',
    imageScale: 1.1,
    tone: 'alert',
    confidence: 31,
    status: 'Unverified Person - Face Obscured',
    statusDetail: 'No badge, no carrier uniform and no known face detected after 01:00.',
    risk: 'High',
    action: 'Trigger Alert & Notify Owner',
    actionDetail: 'Switch on floodlights, start recording and push a priority alert to household members.',
    approveLabel: 'Trigger Alert',
    denyLabel: 'Dismiss',
    detectedClass: 'Person (unknown)',
    zone: 'Porch / Zone A',
    nightVision: true,
    boxes: [
      {
        label: 'AI Badge Verification: FAILED',
        detail: 'No credential found',
        tone: 'yellow',
        top: 19,
        left: 52,
        width: 22.5,
        height: 78,
      },
    ],
    signals: [
      { label: 'Uniform match', value: 'None detected', pass: false },
      { label: 'Badge OCR', value: 'No badge visible', pass: false },
      { label: 'Face match', value: 'Obscured / 0 of 12 known', pass: false },
      { label: 'Time-of-day rule', value: 'Outside 06:00-22:00', pass: false },
    ],
    metadata: [
      { label: 'Detected', value: 'Person (unknown)' },
      { label: 'Zone', value: 'Porch / Zone A' },
      { label: 'Light', value: 'Infrared night mode' },
      { label: 'Dwell time', value: '47s (extended)' },
    ],
  },
  {
    id: 'resident',
    label: 'Authorized Resident',
    shortLabel: 'Resident',
    image: '/scenes/authorized-resident.png',
    imageScale: 1,
    tone: 'verified',
    confidence: 98,
    status: 'Authorized Resident - Maya Chen',
    statusDetail: 'Face match and RingSafe keyfob proximity confirm a household member.',
    risk: 'Low',
    action: 'Disarm Alarm & Unlock Door',
    actionDetail: 'Disarm Ring Alarm, unlock the front door and log the arrival in the household feed.',
    approveLabel: 'Unlock Door',
    denyLabel: 'Keep Locked',
    detectedClass: 'Person (known)',
    zone: 'Walkway / Zone B',
    nightVision: false,
    boxes: [
      {
        label: 'AI Badge Verification',
        detail: 'Resident - Maya Chen',
        tone: 'green',
        top: 25,
        left: 41.5,
        width: 15,
        height: 71,
      },
      {
        label: 'Face 99.1%',
        detail: '',
        tone: 'green',
        top: 26.5,
        left: 46,
        width: 4.6,
        height: 10.5,
      },
    ],
    signals: [
      { label: 'Face match', value: 'Maya Chen / 99.1%', pass: true },
      { label: 'Keyfob proximity', value: 'BLE 2.1m / paired', pass: true },
      { label: 'Household schedule', value: 'Expected arrival', pass: true },
      { label: 'Liveness check', value: 'Passed', pass: true },
    ],
    metadata: [
      { label: 'Detected', value: 'Person (known)' },
      { label: 'Zone', value: 'Walkway / Zone B' },
      { label: 'Identity', value: 'Maya Chen (Owner)' },
      { label: 'Carrying', value: 'Keys, groceries' },
    ],
  },
]

export const DEFAULT_SCENARIO: ScenarioId = 'delivery'

export function getScenario(id: ScenarioId): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0]
}

function eventId(seed: number, n: number) {
  return `evt_${(seed + n * 7919).toString(36)}`
}

function motionEvent(
  scenario: Scenario,
  at: number,
  seed: number,
  n: number,
): WebhookEvent {
  return {
    id: eventId(seed, n),
    type: 'device.motion_detected',
    payload: {
      id: eventId(seed, n),
      event: 'device.motion_detected',
      timestamp: new Date(at).toISOString(),
      device: { id: DEVICE.id, name: DEVICE.name, model: DEVICE.model },
      location_id: DEVICE.location_id,
      data: {
        motion_zone: scenario.zone,
        detection_class: 'person',
        night_vision: scenario.nightVision,
        snapshot_uuid: `snap_${seed.toString(36)}`,
        recording: { resolution: '1080p', status: 'in_progress' },
      },
    },
  }
}

function packageEvent(
  scenario: Scenario,
  at: number,
  seed: number,
  n: number,
): WebhookEvent {
  return {
    id: eventId(seed, n),
    type: 'package.detected',
    payload: {
      id: eventId(seed, n),
      event: 'package.detected',
      timestamp: new Date(at).toISOString(),
      device: { id: DEVICE.id, name: DEVICE.name },
      location_id: DEVICE.location_id,
      data: {
        package_count: 1,
        carrier: 'Amazon Logistics',
        tracking_hint: '1Z-AMZ-7731',
        dimensions: 'M',
        confidence: scenario.confidence / 100,
        ringsafe: {
          badge_id: 'DSP-4821',
          badge_verified: true,
          route_match: true,
          recommended_action: 'grant_porch_access',
        },
      },
    },
  }
}

function dingEvent(
  scenario: Scenario | null,
  at: number,
  seed: number,
  n: number,
): WebhookEvent {
  const verified = scenario ? scenario.tone === 'verified' : null
  return {
    id: eventId(seed, n),
    type: 'ring.doorbell_ding',
    payload: {
      id: eventId(seed, n),
      event: 'ring.doorbell_ding',
      timestamp: new Date(at).toISOString(),
      device: { id: DEVICE.id, name: DEVICE.name, model: DEVICE.model },
      location_id: DEVICE.location_id,
      data: {
        kind: 'ding',
        answered: false,
        live_view_available: true,
        ringsafe: scenario
          ? {
              verification: verified ? 'passed' : 'failed',
              confidence: scenario.confidence / 100,
              risk: scenario.risk.toLowerCase(),
            }
          : { verification: 'pending' },
      },
    },
  }
}

/** Builds the ordered webhook sequence Ring would emit for a scenario. */
export function buildScenarioEvents(
  id: ScenarioId,
  startedAt: number,
): WebhookEvent[] {
  const scenario = getScenario(id)
  const seed = Math.floor(startedAt / 1000)

  if (id === 'delivery') {
    return [
      motionEvent(scenario, startedAt, seed, 1),
      packageEvent(scenario, startedAt + 3200, seed, 2),
      dingEvent(scenario, startedAt + 6100, seed, 3),
    ]
  }
  if (id === 'night') {
    return [
      motionEvent(scenario, startedAt, seed, 1),
      dingEvent(scenario, startedAt + 4800, seed, 2),
    ]
  }
  return [
    motionEvent(scenario, startedAt, seed, 1),
    dingEvent(scenario, startedAt + 2400, seed, 2),
  ]
}

export function buildDingEvent(
  scenarioId: ScenarioId,
  at: number,
  seq: number,
): WebhookEvent {
  return dingEvent(getScenario(scenarioId), at, Math.floor(at / 1000), 90 + seq)
}

/** Delay (ms) between the first event and each subsequent one in the live stream. */
export function streamDelays(events: WebhookEvent[], startedAt: number) {
  return events.map((e) => {
    const t = Date.parse(e.payload.timestamp as string)
    return Math.max(0, (t - startedAt) / 3)
  })
}
