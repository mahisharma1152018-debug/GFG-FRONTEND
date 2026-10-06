import { MOCK_LEADERBOARD, MOCK_WEEKLY_LEADERBOARD } from '@/data/mock/users'
import { MOCK_PROJECTS } from '@/data/mock/projects'
import type { LeaderboardEntry, LeaderboardScope } from '@/types'
import { api, isBackendConfigured, mockLatency } from './api'

export interface LeaderboardQuery {
  scope: LeaderboardScope
  search?: string
  projectId?: string
  contributionType?: string
  college?: string
}

function mapEntry(p: any, index: number): LeaderboardEntry {
  return {
    rank: Number(p.currentRank ?? index + 1),
    user: {
      id: String(p._id ?? p.githubId ?? p.username),
      username: p.username,
      name: p.name ?? p.username,
      githubUrl: p.githubUrl ?? `https://github.com/${p.username}`,
      avatarUrl: p.avatarUrl,
      college: undefined,
    },
    xp: Number(p.points ?? 0),
    mergedPullRequests: Number(p.stats?.mergedPRs ?? 0),
    projectsContributed: Number(p.stats?.uniqueReposContributed ?? 0),
    badges: (p.badges ?? []).map((b: any) => b.badgeKey ?? b.key ?? String(b)),
  }
}

export async function getLeaderboard(query: LeaderboardQuery): Promise<LeaderboardEntry[]> {
  if (isBackendConfigured()) {
    const data = await api.get<any[]>('/participants/leaderboard')
    let entries = data.map(mapEntry)
    const search = query.search?.trim().toLowerCase()
    if (search) entries = entries.filter(e => e.user.username.toLowerCase().includes(search) || e.user.name.toLowerCase().includes(search))
    if (query.scope === 'weekly') {
      // Backend currently exposes an all-time participant leaderboard only.
      // Keep the same data shape rather than fabricating weekly scores.
      entries = entries
    }
    return entries
  }
  await mockLatency()
  let entries = query.scope === 'weekly' ? [...MOCK_WEEKLY_LEADERBOARD] : [...MOCK_LEADERBOARD]
  if (query.scope === 'project' && query.projectId) {
    const seed = MOCK_PROJECTS.findIndex((p) => p.id === query.projectId) + 1
    entries = entries.filter((_, index) => (index + seed) % 3 !== 0)
      .map((entry, index) => ({ ...entry, xp: Math.round(entry.xp / (2 + (seed % 3)) + (entry.xp % (seed + 7))), projectsContributed: 1, rank: index + 1 }))
      .sort((a, b) => b.xp - a.xp).map((entry, index) => ({ ...entry, rank: index + 1 }))
  }
  const search = query.search?.trim().toLowerCase()
  if (search) entries = entries.filter(e => e.user.username.toLowerCase().includes(search) || e.user.name.toLowerCase().includes(search))
  if (query.college && query.college !== 'all') entries = entries.filter(e => e.user.college === query.college)
  return entries
}

export async function getMyStanding(userId: string) {
  const entries = await getLeaderboard({ scope: 'overall' })
  const index = entries.findIndex(e => e.user.id === userId)
  const entry = entries[index] ?? entries[0]
  const next = index > 0 ? entries[index - 1] : undefined
  return { entry, percentile: entry ? Math.max(1, Math.round((1 - Math.max(index, 0) / Math.max(entries.length, 1)) * 100)) : 0, gapToNext: next && entry ? Math.max(0, next.xp - entry.xp) : 0 }
}
