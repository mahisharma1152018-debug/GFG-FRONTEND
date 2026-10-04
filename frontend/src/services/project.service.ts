import { MOCK_PROJECTS, MOCK_PROBLEM_STATEMENTS } from '@/data/mock/projects'
import type { Paginated, ProblemStatement, Project, ProjectFilters } from '@/types'
import { api, isBackendConfigured, mockLatency } from './api'

/**
 * Project / problem-statement repository.
 * TODO: Replace mock branch with GET /projects + GET /problem-statements.
 */

function sortProjects(projects: Project[], sort: ProjectFilters['sort']): Project[] {
  const list = [...projects]
  switch (sort) {
    case 'points':
      return list.sort((a, b) => b.potentialXpMax - a.potentialXpMax)
    case 'difficulty': {
      const order = { hard: 0, medium: 1, easy: 2 } as const
      return list.sort((a, b) => order[a.difficulty] - order[b.difficulty])
    }
    case 'newest':
      return list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    case 'open-issues':
      return list.sort((a, b) => b.openIssues - a.openIssues)
    case 'trending':
    default:
      return list.sort((a, b) => b.stars + b.forks * 2 - (a.stars + a.forks * 2))
  }
}

function applyFilters(projects: Project[], filters: ProjectFilters = {}): Project[] {
  const search = filters.search?.trim().toLowerCase()

  return projects.filter((project) => {
    if (search) {
      const haystack = [project.name, project.tagline, project.description, ...project.technologies, ...project.tags]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(search)) return false
    }
    if (filters.category && filters.category !== 'all' && project.category !== filters.category) return false
    if (filters.difficulty && filters.difficulty !== 'all' && project.difficulty !== filters.difficulty) return false
    if (filters.technology && !project.technologies.includes(filters.technology)) return false
    if (filters.availability === 'slots' && project.slotsAvailable <= 0) return false
    if (filters.contributionType && filters.contributionType !== 'all') {
      const has = MOCK_PROBLEM_STATEMENTS.some(
        (ps) => ps.projectId === project.id && ps.contributionType === filters.contributionType,
      )
      if (!has) return false
    }
    return true
  })
}

export async function getProjects(filters: ProjectFilters = {}): Promise<Paginated<Project>> {
  if (isBackendConfigured()) {
    return api.get<Paginated<Project>>('/projects', { ...filters })
  }

  await mockLatency()
  const filtered = sortProjects(applyFilters(MOCK_PROJECTS, filters), filters.sort)
  const pageSize = filters.pageSize ?? 9
  const page = filters.page ?? 1
  const start = (page - 1) * pageSize

  return {
    items: filtered.slice(start, start + pageSize),
    page,
    pageSize,
    total: filtered.length,
  }
}

export async function getFeaturedProjects(limit = 4): Promise<Project[]> {
  if (isBackendConfigured()) {
    return api.get<Project[]>('/projects', { featured: true, pageSize: limit })
  }
  await mockLatency(240)
  return MOCK_PROJECTS.filter((p) => p.featured).slice(0, limit)
}

export async function getProjectBySlug(slug: string): Promise<Project> {
  if (isBackendConfigured()) {
    return api.get<Project>(`/projects/${slug}`)
  }
  await mockLatency(240)
  const project = MOCK_PROJECTS.find((p) => p.slug === slug || p.id === slug)
  if (!project) throw new Error(`Project "${slug}" was not found.`)
  return project
}

export async function getProblemStatements(projectId?: string): Promise<ProblemStatement[]> {
  if (isBackendConfigured()) {
    return api.get<ProblemStatement[]>('/problem-statements', { projectId })
  }
  await mockLatency()
  return MOCK_PROBLEM_STATEMENTS.filter((ps) => !projectId || ps.projectId === projectId)
}

/** Technologies used across the registry — drives the filter dropdown. */
export async function getTechnologies(): Promise<string[]> {
  if (isBackendConfigured()) {
    return api.get<string[]>('/projects/technologies')
  }
  await mockLatency(120)
  return Array.from(new Set(MOCK_PROJECTS.flatMap((p) => p.technologies))).sort()
}

/** Unique slots helpers reused by the registry header. */
export function registrySummary(projects: Project[]): { repositories: number; openIssues: number; slots: number } {
  return {
    repositories: projects.length,
    openIssues: projects.reduce((sum, p) => sum + p.openIssues, 0),
    slots: projects.reduce((sum, p) => sum + p.slotsAvailable, 0),
  }
}
