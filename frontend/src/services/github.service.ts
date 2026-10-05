import { MOCK_GITHUB_ISSUES, MOCK_PULL_REQUESTS, MOCK_REPOSITORIES, MOCK_VERIFICATIONS } from '@/data/mock/github'
import type { ContributionVerification, GitHubIssue, GitHubPullRequest, GitHubRepository } from '@/types'
import { api, isBackendConfigured, mockLatency } from './api'

function mapRepo(r: any): GitHubRepository {
  return {
    id: String(r.githubId ?? r.githubRepositoryId ?? r._id ?? r.fullName),
    fullName: r.fullName,
    description: r.description ?? '',
    htmlUrl: r.htmlUrl ?? `https://github.com/${r.fullName}`,
    stargazersCount: Number(r.stars ?? 0),
    forksCount: 0,
    openIssuesCount: Number(r.lastSyncStats?.issues ?? 0),
    topics: [],
    language: r.language ?? '',
    pushedAt: r.lastSyncedAt ?? r.updatedAt ?? r.createdAt ?? new Date().toISOString(),
  }
}
function mapPr(pr: any): GitHubPullRequest {
  return {
    id: String(pr.githubPRId ?? pr._id ?? pr.prNumber),
    number: Number(pr.prNumber),
    title: pr.title ?? '',
    htmlUrl: pr.url ?? `https://github.com/${pr.repositoryFullName}/pull/${pr.prNumber}`,
    state: pr.merged ? 'merged' : (pr.state === 'closed' ? 'closed' : 'open'),
    author: pr.author?.username ?? '',
    repository: pr.repositoryFullName ?? '',
    additions: Number(pr.additions ?? 0),
    deletions: Number(pr.deletions ?? 0),
    mergedAt: pr.mergedAt,
  }
}
function mapIssue(i: any): GitHubIssue {
  return {
    id: String(i.githubIssueId ?? i._id ?? i.number),
    number: Number(i.number),
    title: i.title ?? '',
    htmlUrl: i.url ?? i.htmlUrl ?? '',
    state: i.state === 'closed' ? 'closed' : 'open',
    labels: (i.labels ?? []).map((l:any)=>({name:l.name ?? '', color:l.color ?? ''})),
    comments: Number(i.comments ?? 0),
  }
}

export interface ContributorStat {
  username: string; additions: number; deletions: number; pullRequests: number
}

export async function getRepository(owner:string, repo:string) {
  const repos = await getRepositories()
  const found = repos.find(r=>r.fullName.toLowerCase()===`${owner}/${repo}`.toLowerCase())
  if (found) return found
  if (isBackendConfigured()) throw new Error(`Repository ${owner}/${repo} not found`)
  return MOCK_REPOSITORIES.find(r=>r.fullName.endsWith(`/${repo}`)) as GitHubRepository
}
export async function getRepositories() {
  if (isBackendConfigured()) return (await api.get<any[]>('/repositories')).map(mapRepo)
  await mockLatency(260); return MOCK_REPOSITORIES
}
export async function getIssues(projectId:string) {
  if (isBackendConfigured()) {
    const data = await api.get<any[]>('/issues', { repository: projectId })
    return data.map(mapIssue)
  }
  await mockLatency(240); return MOCK_GITHUB_ISSUES[projectId] ?? []
}
export async function getPullRequests(filter?:{author?:string}) {
  if (isBackendConfigured()) return (await api.get<any[]>('/pull-requests', { author: filter?.author })).map(mapPr)
  await mockLatency(260); return filter?.author ? MOCK_PULL_REQUESTS.filter(pr=>pr.author===filter.author) : MOCK_PULL_REQUESTS
}
export async function getContributorStats(repo:string): Promise<ContributorStat[]> {
  if (isBackendConfigured()) {
    const data = await api.get<any[]>('/contributors', { repo })
    return data.map(c=>({username:c.username, additions:c.pullRequests?.additions??0, deletions:c.pullRequests?.deletions??0, pullRequests:c.pullRequests?.opened??0}))
  }
  await mockLatency(300)
  return [{username:'dev_kiran',additions:4820,deletions:1610,pullRequests:21},{username:'priya_codes',additions:3940,deletions:1284,pullRequests:18},{username:'aryan_ops',additions:5210,deletions:2043,pullRequests:16}]
}
export async function getContributionStatus(pullRequestNumber:number): Promise<ContributionVerification> {
  if (isBackendConfigured()) {
    try {
      const rows = await api.get<any[]>('/data/pull-requests', { prNumber: pullRequestNumber, limit: 1 })
      const pr = rows[0]
      if (!pr) throw new Error('not found')
      return {pullRequestNumber, status: pr.merged?'verified':pr.state==='closed'?'rejected':'detected', suggestedXp: undefined, notes:'Status derived from tracked pull-request data.', updatedAt:pr.updatedAtGithub??new Date().toISOString()}
    } catch { return {pullRequestNumber,status:'detected',notes:'Pull request is not present in the tracker yet.',updatedAt:new Date().toISOString()} }
  }
  await mockLatency(200); return MOCK_VERIFICATIONS[pullRequestNumber] ?? {pullRequestNumber,status:'detected',notes:'Waiting for the backend to analyse this pull request.',updatedAt:new Date().toISOString()}
}
export const githubLinks = {
  repo:(url:string)=>url,
  issue:(repo:string,n:number)=>`${repo.replace(/\/$/,'')}/issues/${n}`,
  pullRequest:(repo:string,n:number)=>`${repo.replace(/\/$/,'')}/pull/${n}`,
}
