import { buildActivity, totalFor } from '@/utils/activity'
import { getSession } from '@/services/auth.service'
import { MOCK_USERS, CURRENT_USER_ID, levelForXp } from '@/data/mock/users'
import { LEVEL_THRESHOLDS } from '@/config/site'
import type { ActivityDay } from '@/utils/activity'
import type { User } from '@/types'
import { api, isBackendConfigured, mockLatency } from './api'

/**
 * Participant profiles.
 * TODO: Connect GET /users/:username, GET /users/:username/activity.
 */

export async function getUsers(): Promise<User[]> {
  if (isBackendConfigured()) {
    return api.get<User[]>('/users')
  }
  await mockLatency()
  return MOCK_USERS
}

export async function getUserByUsername(username: string): Promise<User> {
  if (isBackendConfigured()) {
    return api.get<User>(`/users/${username}`)
  }
  await mockLatency(240)
  const user = MOCK_USERS.find((u) => u.username === username)
  if (!user) throw new Error(`Participant "@${username}" was not found.`)
  return user
}

export async function getCurrentUser(): Promise<User> {
  // TODO: Connect authentication — resolve the signed-in GitHub session.
  const session = getSession()
  if (session) return session.user
  const demo = MOCK_USERS.find((u) => u.id === CURRENT_USER_ID) ?? MOCK_USERS[0]
  return getUserByUsername(demo.username)
}

/** GitHub-style contribution grid for a participant. */
export async function getUserActivity(userId: string): Promise<ActivityDay[]> {
  if (isBackendConfigured()) {
    return api.get<ActivityDay[]>(`/users/${userId}/activity`)
  }
  await mockLatency(200)
  const index = Math.max(0, MOCK_USERS.findIndex((u) => u.id === userId))
  const intensity = Math.min(1, 0.25 + (MOCK_USERS[index]?.totalXp ?? 100) / 1600)
  return buildActivity(index + 17, 26, intensity)
}

export interface LevelInfo {
  level: number
  title: string
  currentXp: number
  nextLevelAt: number | null
  previousLevelAt: number
  progress: number
  remaining: number
}

export function getLevelInfo(user: User): LevelInfo {
  const current = LEVEL_THRESHOLDS.find((l) => l.level === user.level) ?? LEVEL_THRESHOLDS[0]
  const next = LEVEL_THRESHOLDS.find((l) => l.level === user.level + 1)
  const span = next ? next.minXp - current.minXp : 1
  const earned = user.totalXp - current.minXp

  return {
    level: user.level,
    title: current.title,
    currentXp: user.totalXp,
    nextLevelAt: next?.minXp ?? null,
    previousLevelAt: current.minXp,
    progress: Math.min(100, Math.max(0, Math.round((earned / span) * 100))),
    remaining: next ? Math.max(0, next.minXp - user.totalXp) : 0,
  }
}

export { levelForXp, totalFor }
