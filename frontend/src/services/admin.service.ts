import { MOCK_ANALYTICS } from '@/data/mock/analytics'
import { MOCK_PROJECTS, MOCK_PROBLEM_STATEMENTS } from '@/data/mock/projects'
import { MOCK_BADGES } from '@/data/mock/badges'
import { MOCK_USERS } from '@/data/mock/users'
import { MOCK_CONTRIBUTIONS } from '@/data/mock/contributions'
import type { Badge, PlatformAnalytics, ProblemStatement, Project, User } from '@/types'
import { api, isBackendConfigured, mockLatency } from './api'

/**
 * Admin CRUD surface.
 *
 * TODO: Connect admin CRUD API — the mock branch mutates an in-memory copy so
 * the interface behaves like the real thing during development.
 */

const projects: Project[] = [...MOCK_PROJECTS]
const problemStatements: ProblemStatement[] = [...MOCK_PROBLEM_STATEMENTS]

export async function getAnalytics(): Promise<PlatformAnalytics> {
  if (isBackendConfigured()) {
    return api.get<PlatformAnalytics>('/admin/analytics')
  }
  await mockLatency(420)
  return MOCK_ANALYTICS
}

/* ---------------------------------------------------------------- projects */

export async function adminListProjects(): Promise<Project[]> {
  if (isBackendConfigured()) return api.get<Project[]>('/admin/projects')
  await mockLatency(300)
  return [...projects]
}

export async function adminCreateProject(input: Partial<Project>): Promise<Project> {
  if (isBackendConfigured()) return api.post<Project>('/admin/projects', input)
  await mockLatency(400)

  const created: Project = {
    id: `p-${String(projects.length + 1).padStart(3, '0')}`,
    name: input.name ?? 'Untitled project',
    slug: (input.slug ?? input.name ?? 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    tagline: input.tagline ?? '',
    description: input.description ?? '',
    repositoryUrl: input.repositoryUrl ?? '',
    admin: input.admin ?? { name: 'Unassigned', username: 'unassigned', githubUrl: '' },
    technologies: input.technologies ?? [],
    difficulty: input.difficulty ?? 'medium',
    status: input.status ?? 'active',
    category: input.category ?? 'Developer Tools',
    tags: input.tags ?? [],
    featured: input.featured ?? false,
    openIssues: input.openIssues ?? 0,
    slotsAvailable: input.slotsAvailable ?? 0,
    slotsTotal: input.slotsTotal ?? 0,
    potentialXpMin: input.potentialXpMin ?? 5,
    potentialXpMax: input.potentialXpMax ?? 150,
    stars: 0,
    forks: 0,
    createdAt: new Date().toISOString(),
    guidelines: input.guidelines ?? [],
    requirements: input.requirements ?? [],
  }

  projects.unshift(created)
  return created
}

export async function adminUpdateProject(id: string, patch: Partial<Project>): Promise<Project> {
  if (isBackendConfigured()) return api.patch<Project>(`/admin/projects/${id}`, patch)
  await mockLatency(360)
  const index = projects.findIndex((p) => p.id === id)
  if (index === -1) throw new Error('Project not found')
  projects[index] = { ...projects[index], ...patch }
  return projects[index]
}

export async function adminArchiveProject(id: string): Promise<void> {
  if (isBackendConfigured()) {
    await api.delete(`/admin/projects/${id}`)
    return
  }
  await mockLatency(320)
  const index = projects.findIndex((p) => p.id === id)
  if (index !== -1) projects[index] = { ...projects[index], status: 'archived' }
}

/* ------------------------------------------------------- problem statements */

export async function adminListProblemStatements(projectId?: string): Promise<ProblemStatement[]> {
  if (isBackendConfigured()) {
    return api.get<ProblemStatement[]>('/admin/problem-statements', { projectId })
  }
  await mockLatency(300)
  return problemStatements.filter((ps) => !projectId || ps.projectId === projectId)
}

export async function adminCreateProblemStatement(
  input: Partial<ProblemStatement>,
): Promise<ProblemStatement> {
  if (isBackendConfigured()) return api.post<ProblemStatement>('/admin/problem-statements', input)
  await mockLatency(420)

  const created: ProblemStatement = {
    id: `ps-${String(problemStatements.length + 1).padStart(3, '0')}`,
    projectId: input.projectId ?? projects[0].id,
    title: input.title ?? 'Untitled problem statement',
    description: input.description ?? '',
    githubIssueUrl: input.githubIssueUrl ?? '',
    difficulty: input.difficulty ?? 'medium',
    contributionType: input.contributionType ?? 'bug-fix',
    technology: input.technology ?? 'TypeScript',
    expectedXpMin: input.expectedXpMin ?? 5,
    expectedXpMax: input.expectedXpMax ?? 150,
    status: input.status ?? 'open',
    deadline: input.deadline,
    requirements: input.requirements ?? [],
  }

  problemStatements.unshift(created)
  return created
}

export async function adminUpdateProblemStatement(
  id: string,
  patch: Partial<ProblemStatement>,
): Promise<ProblemStatement> {
  if (isBackendConfigured()) return api.patch<ProblemStatement>(`/admin/problem-statements/${id}`, patch)
  await mockLatency(340)
  const index = problemStatements.findIndex((ps) => ps.id === id)
  if (index === -1) throw new Error('Problem statement not found')
  problemStatements[index] = { ...problemStatements[index], ...patch }
  return problemStatements[index]
}

export async function adminDeleteProblemStatement(id: string): Promise<void> {
  if (isBackendConfigured()) {
    await api.delete(`/admin/problem-statements/${id}`)
    return
  }
  await mockLatency(300)
  const index = problemStatements.findIndex((ps) => ps.id === id)
  if (index !== -1) problemStatements.splice(index, 1)
}

/* ------------------------------------------------------------ participants */

export async function adminListParticipants(): Promise<User[]> {
  if (isBackendConfigured()) return api.get<User[]>('/admin/participants')
  await mockLatency(300)
  return MOCK_USERS
}

export async function adminListContributions() {
  if (isBackendConfigured()) return api.get<typeof MOCK_CONTRIBUTIONS>('/admin/contributions')
  await mockLatency(300)
  return MOCK_CONTRIBUTIONS
}

export async function adminListBadges(): Promise<Badge[]> {
  if (isBackendConfigured()) return api.get<Badge[]>('/admin/badges')
  await mockLatency(280)
  return MOCK_BADGES
}
