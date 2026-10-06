/** Site-wide configuration. Values are data-driven so nothing is hardcoded in UI. */

import type { EventStats } from '@/types'

const EVENT_START = '2026-10-11T00:00:00+05:30'
const EVENT_END_EXCLUSIVE = '2026-10-18T00:00:00+05:30'
const EVENT_START_DATE = new Date(EVENT_START)
const EVENT_END_DATE = new Date(Date.parse(EVENT_END_EXCLUSIVE) - 1)
const EVENT_LONG_MONTH_DAY = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' })
const EVENT_SHORT_DATE = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' })
const EVENT_DAY = new Intl.DateTimeFormat('en-US', { day: 'numeric', timeZone: 'Asia/Kolkata' })
const EVENT_YEAR = new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: 'Asia/Kolkata' }).format(EVENT_START_DATE)

export type EventStatus = 'upcoming' | 'live' | 'ended'

export const EVENT_CONFIG = {
  name: 'GEEKTOBER',
  start: EVENT_START,
  endExclusive: EVENT_END_EXCLUSIVE,
  timezone: 'Asia/Kolkata',
  durationDays: 7,
  dateLabel: `${EVENT_LONG_MONTH_DAY.format(EVENT_START_DATE)}–${EVENT_DAY.format(EVENT_END_DATE)}, ${EVENT_YEAR}`,
  shortDateLabel: `${EVENT_SHORT_DATE.format(EVENT_START_DATE)}–${EVENT_DAY.format(EVENT_END_DATE)}, ${EVENT_YEAR}`,
  startDateLabel: EVENT_SHORT_DATE.format(EVENT_START_DATE),
  endDateLabel: EVENT_SHORT_DATE.format(EVENT_END_DATE),
} as const

export function getEventStatus(now = new Date()): EventStatus {
  const timestamp = now.getTime()
  const start = Date.parse(EVENT_CONFIG.start)
  const end = Date.parse(EVENT_CONFIG.endExclusive)
  if (timestamp < start) return 'upcoming'
  if (timestamp < end) return 'live'
  return 'ended'
}

export function getEventStatusLabel(now = new Date()): string {
  const status = getEventStatus(now)
  if (status === 'live') return 'LIVE NOW'
  if (status === 'ended') return 'EVENT ENDED'
  return 'STARTS OCT 11'
}

export interface NavItem {
  label: string
  to: string
  /** Anchor id when the link points at a section of another page. */
  hash?: string
  auth?: 'participant' | 'admin' | 'any'
}

export const SITE_CONFIG = {
  name: 'GEEKTOBER',
  fullName: 'GEEKTOBER',
  chapter: 'GFG STUDENT CHAPTER RBU',
  shortName: 'GEEKTOBER',
  tagline: 'Code. Contribute. Compete.',
  description:
    'An open-source contribution competition where developers build, fix, contribute and compete.',
  motto: 'Turn open-source contributions into achievements.',
  githubUrl: 'https://github.com/gfg-rbu',
  discordUrl: 'https://discord.gg/NudkYYGq5',
  whatsappUrl: import.meta.env.VITE_WHATSAPP_URL ?? '',
  instagramUrl: 'https://www.instagram.com/gfg_campusbody_rbu?stkn=MWtzcGlyZmtqbW16cg==',
  linkedinUrl: 'https://www.linkedin.com/company/geeksforgeeks-rcoem-chapter/home/',
  email: 'gfgrcoem@rknec.edu',
  venue: 'Open Source • Online + Campus Finals',
  dates: EVENT_CONFIG.shortDateLabel,
  edition: '2026 Edition',
  eventStart: EVENT_CONFIG.start,
  eventEndExclusive: EVENT_CONFIG.endExclusive,
  eventDurationDays: EVENT_CONFIG.durationDays,
} as const

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Projects', to: '/projects' },
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Rules', to: '/rules' },
  { label: 'Badges', to: '/badges' },
  { label: 'About', to: '/about' },
]

/**
 * Development-only fallback statistics. When the backend is configured, the UI
 * uses GET /stats instead of presenting these illustrative values as live data.
 */
export const EVENT_STATS_FALLBACK: EventStats[] = [
  { id: 'repositories', label: 'Repositories', value: 12, suffix: '+', hint: 'curated repositories' },
  { id: 'issues', label: 'Open Issues', value: 450, suffix: '+', hint: 'ready to be solved' },
  { id: 'participants', label: 'Participants', value: 800, suffix: '+', hint: 'registered developers' },
  { id: 'badges', label: 'Achievement Badges', value: 50, suffix: '+', hint: 'unlock with contributions' },
]

export const LEVEL_THRESHOLDS = [
  { level: 1, title: 'Initiate', minXp: 0 },
  { level: 2, title: 'Committer', minXp: 150 },
  { level: 3, title: 'Contributor', minXp: 400 },
  { level: 4, title: 'Maintainer', minXp: 720 },
  { level: 5, title: 'Reviewer', minXp: 1200 },
  { level: 6, title: 'Architect', minXp: 1800 },
  { level: 7, title: 'Open Source Hero', minXp: 2600 },
] as const
