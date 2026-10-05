import { MOCK_PROJECTS, MOCK_PROBLEM_STATEMENTS } from '@/data/mock/projects'
import type { Paginated, ProblemStatement, Project, ProjectFilters } from '@/types'
import { api, isBackendConfigured, mockLatency } from './api'

function repoToProject(r: any, index = 0): Project {
  const fullName = r.fullName ?? `${r.owner ?? 'unknown'}/${r.name ?? 'repository'}`
  const [owner, name] = fullName.split('/')
  const openIssues = Number(r.lastSyncStats?.issues ?? r.openIssuesCount ?? 0)
  return {
    id: String(r.githubId ?? r.githubRepositoryId ?? r._id ?? fullName),
    name: r.name ?? name,
    slug: fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    tagline: r.description ?? 'Tracked open-source repository',
    description: r.description ?? '',
    repositoryUrl: r.htmlUrl ?? `https://github.com/${fullName}`,
    admin: { name: owner ?? 'GitHub', username: owner ?? '', githubUrl: `https://github.com/${owner ?? ''}` },
    technologies: [r.language].filter(Boolean),
    difficulty: 'medium',
    status: r.archived ? 'archived' : 'active',
    category: 'Open Source Utilities',
    tags: [],
    featured: index < 4,
    openIssues,
    slotsAvailable: 0,
    slotsTotal: 0,
    potentialXpMin: 0,
    potentialXpMax: 0,
    stars: Number(r.stars ?? 0),
    forks: 0,
    createdAt: r.createdAt ?? new Date().toISOString(),
    guidelines: [],
    requirements: [],
  }
}

function sortProjects(projects: Project[], sort: ProjectFilters['sort']): Project[] {
  return [...projects].sort((a,b) => {
    if (sort === 'points') return b.potentialXpMax - a.potentialXpMax
    if (sort === 'difficulty') return 0
    if (sort === 'newest') return Date.parse(b.createdAt) - Date.parse(a.createdAt)
    if (sort === 'open-issues') return b.openIssues - a.openIssues
    return b.stars + b.forks * 2 - (a.stars + a.forks * 2)
  })
}

function applyFilters(projects: Project[], filters: ProjectFilters = {}) {
  const search = filters.search?.trim().toLowerCase()
  return projects.filter(p => {
    if (search && ![p.name,p.tagline,p.description,...p.technologies,...p.tags].join(' ').toLowerCase().includes(search)) return false
    if (filters.category && filters.category !== 'all' && p.category !== filters.category) return false
    if (filters.difficulty && filters.difficulty !== 'all' && p.difficulty !== filters.difficulty) return false
    if (filters.technology && !p.technologies.includes(filters.technology)) return false
    if (filters.availability === 'slots' && p.slotsAvailable <= 0) return false
    return true
  })
}

export async function getProjects(filters: ProjectFilters = {}): Promise<Paginated<Project>> {
  if (isBackendConfigured()) {
    const repos = await api.get<any[]>('/repositories')
    const all = repos.map(repoToProject)
    const filtered = sortProjects(applyFilters(all, filters), filters.sort)
    const pageSize = filters.pageSize ?? 9, page = filters.page ?? 1
    const start = (page - 1) * pageSize
    return { items: filtered.slice(start,start+pageSize), page, pageSize, total: filtered.length }
  }
  await mockLatency()
  const filtered = sortProjects(applyFilters(MOCK_PROJECTS, filters), filters.sort)
  const pageSize = filters.pageSize ?? 9, page = filters.page ?? 1, start = (page - 1) * pageSize
  return { items: filtered.slice(start,start+pageSize), page, pageSize, total: filtered.length }
}

export async function getFeaturedProjects(limit=4) {
  if (isBackendConfigured()) return (await api.get<any[]>('/repositories')).slice(0,limit).map(repoToProject)
  await mockLatency(240); return MOCK_PROJECTS.filter(p=>p.featured).slice(0,limit)
}

export async function getProjectBySlug(slug: string) {
  if (isBackendConfigured()) {
    const repos = await api.get<any[]>('/repositories')
    const found = repos.find(r => (r.fullName ?? '').toLowerCase().replace(/[^a-z0-9]+/g,'-') === slug || r.githubId?.toString() === slug || r.githubRepositoryId?.toString() === slug)
    if (!found) throw new Error(`Project "${slug}" was not found.`)
    return repoToProject(found)
  }
  await mockLatency(240)
  const project = MOCK_PROJECTS.find(p => p.slug === slug || p.id === slug)
  if (!project) throw new Error(`Project "${slug}" was not found.`)
  return project
}

export async function getProblemStatements(projectId?: string): Promise<ProblemStatement[]> {
  // The supplied backend has no problem-statement resource.
  if (isBackendConfigured()) return []
  await mockLatency(); return MOCK_PROBLEM_STATEMENTS.filter(ps=>!projectId || ps.projectId===projectId)
}

export async function getTechnologies(): Promise<string[]> {
  if (isBackendConfigured()) {
    const repos = await api.get<any[]>('/repositories')
    return Array.from(new Set(repos.map(r=>r.language).filter(Boolean))).sort() as string[]
  }
  await mockLatency(120); return Array.from(new Set(MOCK_PROJECTS.flatMap(p=>p.technologies))).sort()
}

export function registrySummary(projects: Project[]) {
  return { repositories: projects.length, openIssues: projects.reduce((s,p)=>s+p.openIssues,0), slots: projects.reduce((s,p)=>s+p.slotsAvailable,0) }
}
