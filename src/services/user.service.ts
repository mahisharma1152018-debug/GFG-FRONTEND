import { buildActivity, totalFor } from '@/utils/activity'
import { getSession } from '@/services/auth.service'
import { MOCK_USERS, CURRENT_USER_ID, levelForXp } from '@/data/mock/users'
import { LEVEL_THRESHOLDS } from '@/config/site'
import type { ActivityDay } from '@/utils/activity'
import type { User } from '@/types'
import { api, isBackendConfigured, mockLatency } from './api'

function participantToUser(p: any): User {
  return {
    id: String(p._id ?? p.githubId ?? p.username),
    username: p.username,
    name: p.name ?? p.username,
    role: 'participant',
    githubUrl: p.githubUrl ?? `https://github.com/${p.username}`,
    avatarUrl: p.avatarUrl,
    totalXp: Number(p.points ?? 0),
    rank: Number(p.currentRank ?? 0),
    mergedPullRequests: Number(p.stats?.mergedPRs ?? 0),
    projectsContributed: Number(p.stats?.uniqueReposContributed ?? 0),
    streakDays: Number(p.stats?.loginStreak ?? 0),
    level: 1,
    joinedAt: p.createdAt ?? new Date().toISOString(),
    badges: (p.badges ?? []).map((b: any) => b.badgeKey ?? b.key ?? String(b)),
  }
}

export async function getUsers(): Promise<User[]> {
  if (isBackendConfigured()) {
    const rows = await api.get<any[]>('/participants/leaderboard')
    return rows.map(participantToUser)
  }
  await mockLatency()
  return MOCK_USERS
}

export async function getUserByUsername(username: string): Promise<User> {
  if (isBackendConfigured()) {
    const profile = await api.get<any>(`/participants/profile/${encodeURIComponent(username)}`)
    return participantToUser(profile)
  }
  await mockLatency(240)
  const user = MOCK_USERS.find((u) => u.username === username)
  if (!user) throw new Error(`Participant "@${username}" was not found.`)
  return user
}

export async function getCurrentUser(): Promise<User> {
  const session = getSession()
  if (session) return session.user
  if (isBackendConfigured()) {
    const me = await api.get<any>('/auth/me')
    return participantToUser(me)
  }
  const demo = MOCK_USERS.find((u) => u.id === CURRENT_USER_ID) ?? MOCK_USERS[0]
  return demo
}

export async function getUserActivity(userId: string): Promise<ActivityDay[]> {
  if (isBackendConfigured()) {
    const raw = await api.get<any>(`/users/${encodeURIComponent(userId)}/activity`)
    const dates = new Set<string>([
      ...(raw?.commitDates ?? []),
      ...(raw?.loginDates ?? []),
    ])
    return Array.from(dates).map((date) => ({ date, count: 1, level: 1 }))
  }
  await mockLatency(200)
  const index = Math.max(0, MOCK_USERS.findIndex((u) => u.id === userId))
  const intensity = Math.min(1, 0.25 + (MOCK_USERS[index]?.totalXp ?? 100) / 1600)
  return buildActivity(index + 17, 26, intensity)
}

export interface LevelInfo {
  level: number; title: string; currentXp: number; nextLevelAt: number | null
  previousLevelAt: number; progress: number; remaining: number
}

export function getLevelInfo(user: User): LevelInfo {
  const current = LEVEL_THRESHOLDS.find((l) => l.level === user.level) ?? LEVEL_THRESHOLDS[0]
  const next = LEVEL_THRESHOLDS.find((l) => l.level === user.level + 1)
  const span = next ? next.minXp - current.minXp : 1
  const earned = user.totalXp - current.minXp
  return {
    level: user.level, title: current.title, currentXp: user.totalXp,
    nextLevelAt: next?.minXp ?? null, previousLevelAt: current.minXp,
    progress: Math.min(100, Math.max(0, Math.round((earned / span) * 100))),
    remaining: next ? Math.max(0, next.minXp - user.totalXp) : 0,
  }
}
export { levelForXp, totalFor }
