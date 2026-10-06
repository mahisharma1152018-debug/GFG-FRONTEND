import { useQuery } from '@tanstack/react-query'
import { getLeaderboard, getMyStanding } from '@/services/leaderboard.service'
import type { LeaderboardQuery } from '@/services/leaderboard.service'
import { getUserActivity, getUserByUsername, getUsers } from '@/services/user.service'

/** Leaderboard + participant queries. TODO: Connect leaderboard API. */

export function useLeaderboard(query: LeaderboardQuery) {
  return useQuery({
    queryKey: ['leaderboard', query],
    queryFn: () => getLeaderboard(query),
    placeholderData: (previous) => previous,
  })
}

export function useMyStanding(userId?: string) {
  return useQuery({
    queryKey: ['leaderboard', 'me', userId],
    queryFn: () => getMyStanding(userId ?? ''),
    enabled: Boolean(userId),
  })
}

export function useParticipants() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 30_000,
  })
}

export function useProfile(username?: string) {
  return useQuery({
    queryKey: ['users', username],
    queryFn: () => getUserByUsername(username ?? ''),
    enabled: Boolean(username),
  })
}

export function useActivity(userId?: string) {
  return useQuery({
    queryKey: ['activity', userId],
    queryFn: () => getUserActivity(userId ?? ''),
    enabled: Boolean(userId),
    staleTime: 60_000,
  })
}
