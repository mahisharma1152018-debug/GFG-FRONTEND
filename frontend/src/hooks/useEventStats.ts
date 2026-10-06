import { useQuery } from '@tanstack/react-query'
import type { EventStats } from '@/types'
import { EVENT_STATS_FALLBACK } from '@/config/site'
import { api, isBackendConfigured } from '@/services/api'

export function useEventStats() {
  return useQuery({
    queryKey: ['event-stats'],
    queryFn: async (): Promise<EventStats[]> => {
      if (!isBackendConfigured()) return EVENT_STATS_FALLBACK
      return api.get<EventStats[]>('/stats')
    },
    staleTime: 60_000,
  })
}
