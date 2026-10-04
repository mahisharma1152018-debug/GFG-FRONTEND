import {
  MOCK_GITHUB_ISSUES,
  MOCK_PULL_REQUESTS,
  MOCK_REPOSITORIES,
  MOCK_VERIFICATIONS,
} from '@/data/mock/github'
import type { ContributionVerification, GitHubIssue, GitHubPullRequest, GitHubRepository } from '@/types'
import { api, isBackendConfigured, mockLatency } from './api'

/**
 * GitHub integration abstraction.
 *
 * The frontend never talks to GitHub directly. In production the backend owns
 * the GitHub App and exposes:
 *
 *   GitHub App -> webhook -> Express -> PR analysis -> verification -> XP
 *
 * Every function below is a placeholder for that API.
 * TODO: Connect GitHub webhook data.
 */

export interface ContributorStat {
  username: string
  additions: number
  deletions: number
  pullRequests: number
}

export async function getRepository(owner: string, repo: string): Promise<GitHubRepository> {
  if (isBackendConfigured()) {
    return api.get<GitHubRepository>(`/github/repos/${owner}/${repo}`)
  }
  await mockLatency(240)
  const found = MOCK_REPOSITORIES.find((r) => r.fullName.endsWith(`/${repo}`))
  if (!found) throw new Error(`Repository ${owner}/${repo} not found`)
  return found
}

export async function getRepositories(): Promise<GitHubRepository[]> {
  if (isBackendConfigured()) return api.get<GitHubRepository[]>('/github/repos')
  await mockLatency(260)
  return MOCK_REPOSITORIES
}

export async function getIssues(projectId: string): Promise<GitHubIssue[]> {
  if (isBackendConfigured()) return api.get<GitHubIssue[]>(`/github/projects/${projectId}/issues`)
  await mockLatency(240)
  return MOCK_GITHUB_ISSUES[projectId] ?? []
}

export async function getPullRequests(filter?: { author?: string }): Promise<GitHubPullRequest[]> {
  if (isBackendConfigured()) return api.get<GitHubPullRequest[]>('/github/pull-requests', { ...filter })
  await mockLatency(260)
  if (!filter?.author) return MOCK_PULL_REQUESTS
  return MOCK_PULL_REQUESTS.filter((pr) => pr.author === filter.author)
}

export async function getContributorStats(repo: string): Promise<ContributorStat[]> {
  if (isBackendConfigured()) return api.get<ContributorStat[]>(`/github/repos/${repo}/stats`)
  await mockLatency(300)
  return [
    { username: 'dev_kiran', additions: 4820, deletions: 1610, pullRequests: 21 },
    { username: 'priya_codes', additions: 3940, deletions: 1284, pullRequests: 18 },
    { username: 'aryan_ops', additions: 5210, deletions: 2043, pullRequests: 16 },
  ]
}

/** Verification status of a single PR in the scoring pipeline. */
export async function getContributionStatus(pullRequestNumber: number): Promise<ContributionVerification> {
  if (isBackendConfigured()) {
    return api.get<ContributionVerification>(`/github/pull-requests/${pullRequestNumber}/verification`)
  }
  await mockLatency(200)
  const found = MOCK_VERIFICATIONS[pullRequestNumber]
  if (!found) {
    return {
      pullRequestNumber,
      status: 'detected',
      notes: 'Waiting for the backend to analyse this pull request.',
      updatedAt: new Date().toISOString(),
    }
  }
  return found
}

/** Convenience link builders used across cards and detail pages. */
export const githubLinks = {
  repo: (url: string) => url,
  issue: (projectRepo: string, issueNumber: number) =>
    `${projectRepo.replace(/\/$/, '')}/issues/${issueNumber}`,
  pullRequest: (projectRepo: string, prNumber: number) =>
    `${projectRepo.replace(/\/$/, '')}/pull/${prNumber}`,
}
