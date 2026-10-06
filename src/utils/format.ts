import type { ContributionType, Difficulty } from '@/types'

/** Human readable labels for every enum-like union in the domain model. */

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

export const CONTRIBUTION_TYPE_LABEL: Record<ContributionType, string> = {
  'bug-fix': 'Bug Fix',
  feature: 'Feature',
  'ui-ux': 'UI / UX',
  documentation: 'Documentation',
  performance: 'Performance',
  testing: 'Testing',
  refactor: 'Refactor',
  integration: 'Integration',
}

export const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  upcoming: 'Upcoming',
  completed: 'Completed',
  archived: 'Archived',
  open: 'Open',
  claimed: 'Claimed',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
  merged: 'Merged',
  draft: 'Draft',
  'in-review': 'In Review',
  closed: 'Closed',
  pending: 'Pending',
  approved: 'Approved',
  'changes-requested': 'Changes Requested',
  rejected: 'Rejected',
}

export function formatXp(value: number): string {
  return `${value.toLocaleString('en-US')} XP`
}

export function formatCompact(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`
  return String(value)
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(iso),
  )
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(iso))
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.round(days / 30)
  return `${months}mo ago`
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function range(min: number, max: number): string {
  return min === max ? `${min} XP` : `${min}–${max} XP`
}

export function plural(count: number, singular: string, pluralForm?: string): string {
  return `${count} ${count === 1 ? singular : (pluralForm ?? `${singular}s`)}`
}
