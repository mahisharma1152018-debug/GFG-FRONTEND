import { useQuery } from '@tanstack/react-query'
import { getFeaturedProjects, getProblemStatements, getProjectBySlug, getProjects } from '@/services/project.service'
import type { ProjectFilters } from '@/types'

/** Project discovery queries. TODO: Replace mock branch with REST responses. */

export function useProjects(filters: ProjectFilters, enabled = true) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => getProjects(filters),
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useFeaturedProjects(limit = 4) {
  return useQuery({
    queryKey: ['projects', 'featured', limit],
    queryFn: () => getFeaturedProjects(limit),
    staleTime: 60_000,
  })
}

export function useProject(slug?: string) {
  return useQuery({
    queryKey: ['projects', 'detail', slug],
    queryFn: () => getProjectBySlug(slug ?? ''),
    enabled: Boolean(slug),
  })
}

export function useProblemStatements(projectId?: string, enabled = true) {
  return useQuery({
    queryKey: ['problem-statements', projectId ?? 'all'],
    queryFn: () => getProblemStatements(projectId),
    enabled,
  })
}
