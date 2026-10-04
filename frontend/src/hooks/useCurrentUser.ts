import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { getCurrentUser } from '@/services/user.service'

/**
 * Resolves the participant the workspace belongs to.
 * Falls back to the demo participant while unauthenticated so public
 * previews (landing page, profile) still render.
 * TODO: Connect authentication.
 */
export function useCurrentUser() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['current-user', user?.id ?? 'demo'],
    queryFn: getCurrentUser,
    initialData: user ?? undefined,
    staleTime: 60_000,
  })
}
