import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  estimateXp,
  getContributionProgress,
  getContributions,
  getScoringConfig,
  saveScoringConfig,
} from '@/services/contribution.service'
import type { CalculatorInput } from '@/types'
import { getBadges, getRecentlyUnlocked, getUserBadges } from '@/services/badge.service'

/** Contribution history, progress tracker, badges and scoring queries. */

export function useContributions(filter?: { userId?: string; projectId?: string; status?: string }) {
  return useQuery({
    queryKey: ['contributions', filter ?? {}],
    queryFn: () => getContributions(filter),
  })
}

export function useProgress(userId?: string) {
  return useQuery({
    queryKey: ['progress', userId ?? 'me'],
    queryFn: () => getContributionProgress(userId),
  })
}

export function useBadges() {
  return useQuery({ queryKey: ['badges'], queryFn: getBadges, staleTime: 60_000 })
}

export function useUserBadges(userId?: string) {
  return useQuery({
    queryKey: ['badges', 'user', userId],
    queryFn: () => getUserBadges(userId ?? ''),
    enabled: Boolean(userId),
  })
}

export function useFeaturedBadges() {
  return useQuery({
    queryKey: ['badges', 'recent'],
    queryFn: () => getRecentlyUnlocked(6),
    staleTime: 60_000,
  })
}

export function useScoringConfig() {
  return useQuery({
    queryKey: ['scoring'],
    queryFn: getScoringConfig,
    staleTime: 5 * 60_000,
  })
}

/** Debounced XP estimate for the interactive calculator. */
export function useXpEstimate(input: CalculatorInput, enabled: boolean) {
  return useQuery({
    queryKey: ['scoring', 'estimate', input],
    queryFn: () => estimateXp(input),
    enabled,
    staleTime: 30_000,
  })
}

export function useSaveScoringConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveScoringConfig,
    onSuccess: (config) => {
      queryClient.setQueryData(['scoring'], config)
    },
  })
}
