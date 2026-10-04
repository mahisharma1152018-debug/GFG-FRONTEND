import { MOCK_BADGES } from '@/data/mock/badges'
import { MOCK_USERS } from '@/data/mock/users'
import type { Badge } from '@/types'
import { api, isBackendConfigured, mockLatency } from './api'

/**
 * Badge catalogue and per-user unlocks.
 * TODO: Connect GET /badges and GET /users/:id/badges.
 */

export async function getBadges(): Promise<Badge[]> {
  if (isBackendConfigured()) {
    return api.get<Badge[]>('/badges')
  }
  await mockLatency()
  return MOCK_BADGES
}

export async function getUserBadges(userId: string): Promise<Badge[]> {
  if (isBackendConfigured()) {
    return api.get<Badge[]>(`/users/${userId}/badges`)
  }
  await mockLatency(220)
  const user = MOCK_USERS.find((u) => u.id === userId)
  return MOCK_BADGES.map((badge) => ({
    ...badge,
    unlocked: badge.unlocked && (user ? user.badges.includes(badge.id) : true),
  }))
}

export async function getRecentlyUnlocked(limit = 4): Promise<Badge[]> {
  if (isBackendConfigured()) {
    return api.get<Badge[]>('/badges', { sort: 'recent', pageSize: limit })
  }
  await mockLatency(160)
  return MOCK_BADGES.filter((b) => b.unlocked)
    .slice()
    .sort((a, b) => Date.parse(b.unlockedAt ?? '0') - Date.parse(a.unlockedAt ?? '0'))
    .slice(0, limit)
}
