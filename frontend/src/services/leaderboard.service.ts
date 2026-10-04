import { MOCK_LEADERBOARD, MOCK_WEEKLY_LEADERBOARD } from '@/data/mock/users'
import { MOCK_PROJECTS } from '@/data/mock/projects'
import type { LeaderboardEntry, LeaderboardScope } from '@/types'
import { api, isBackendConfigured, mockLatency } from './api'

/**
 * Leaderboard queries.
 * TODO: Connect GET /leaderboard?scope=&search=&type=&college=
 */

export interface LeaderboardQuery {
  scope: LeaderboardScope
  search?: string
  projectId?: string
  contributionType?: string
  college?: string
}

export async function getLeaderboard(query: LeaderboardQuery): Promise<LeaderboardEntry[]> {
  if (isBackendConfigured()) {
    return api.get<LeaderboardEntry[]>('/leaderboard', { ...query })
  }

  await mockLatency()
  let entries =
    query.scope === 'weekly' ? [...MOCK_WEEKLY_LEADERBOARD] : [...MOCK_LEADERBOARD]

  if (query.scope === 'project' && query.projectId) {
    // Derive a project-scoped ranking from participants who merged PRs there.
    const seed = MOCK_PROJECTS.findIndex((p) => p.id === query.projectId) + 1
    entries = entries
      .filter((_, index) => (index + seed) % 3 !== 0)
      .map((entry, index) => ({
        ...entry,
        xp: Math.round(entry.xp / (2 + (seed % 3)) + (entry.xp % (seed + 7))),
        projectsContributed: 1,
        rank: index + 1,
      }))
      .sort((a, b) => b.xp - a.xp)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
  }

  const search = query.search?.trim().toLowerCase()
  if (search) {
    entries = entries.filter(
      (entry) =>
        entry.user.username.toLowerCase().includes(search) ||
        entry.user.name.toLowerCase().includes(search),
    )
  }

  if (query.college && query.college !== 'all') {
    entries = entries.filter((entry) => entry.user.college === query.college)
  }

  if (query.contributionType && query.contributionType !== 'all') {
    const weight: Record<string, number> = {
      'bug-fix': 0.7,
      feature: 1.3,
      documentation: 0.5,
      testing: 0.6,
      'ui-ux': 0.9,
      performance: 1.2,
      refactor: 0.8,
      integration: 1,
    }
    const factor = weight[query.contributionType] ?? 1
    entries = entries
      .map((entry, index) => ({
        ...entry,
        xp: Math.max(10, Math.round(entry.xp * factor + (index % 4) * 7)),
      }))
      .sort((a, b) => b.xp - a.xp)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
  }

  return entries
}

/** Standings snapshot for the current user (dashboard "your position"). */
export async function getMyStanding(userId: string): Promise<{
  entry: LeaderboardEntry
  percentile: number
  gapToNext: number
}> {
  if (isBackendConfigured()) {
    return api.get(`/leaderboard/me/${userId}`)
  }

  await mockLatency(200)
  const entries = await getLeaderboard({ scope: 'overall' })
  const index = entries.findIndex((e) => e.user.id === userId)
  const entry = entries[index] ?? entries[0]
  const next = entries[index - 1]

  return {
    entry,
    percentile: Math.max(1, Math.round((1 - index / entries.length) * 100)),
    gapToNext: next ? Math.max(0, next.xp - entry.xp) : 0,
  }
}
