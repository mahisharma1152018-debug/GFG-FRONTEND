import type {
  ContributionVerification,
  GitHubIssue,
  GitHubPullRequest,
  GitHubRepository,
} from '@/types'

/**
 * Mock GitHub integration payloads.
 *
 * In production these are proxied through the backend:
 *   GitHub App -> webhook -> Express -> PR analysis -> classification -> XP
 * The frontend only ever calls github.service.ts, so swapping in the real
 * endpoint requires no component changes.
 */

const ORG = 'https://github.com/gfg-hacktober-fest'

export const MOCK_REPOSITORIES: GitHubRepository[] = [
  {
    id: 'r-001',
    fullName: 'gfg-hacktober-fest/codeflow',
    description: 'Open-source workflow automation for engineering teams.',
    htmlUrl: `${ORG}/codeflow`,
    stargazersCount: 1284,
    forksCount: 316,
    openIssuesCount: 24,
    topics: ['automation', 'webhooks', 'ci-cd'],
    language: 'TypeScript',
    pushedAt: '2026-10-20T14:10:00.000Z',
  },
  {
    id: 'r-002',
    fullName: 'gfg-hacktober-fest/patchsense',
    description: 'Local-first pull request reviewer with explainable suggestions.',
    htmlUrl: `${ORG}/patchsense`,
    stargazersCount: 2140,
    forksCount: 402,
    openIssuesCount: 18,
    topics: ['code-review', 'diff', 'parsing'],
    language: 'TypeScript',
    pushedAt: '2026-10-20T09:32:00.000Z',
  },
  {
    id: 'r-003',
    fullName: 'gfg-hacktober-fest/pixelpilot',
    description: 'Accessible headless component library with a React adapter.',
    htmlUrl: `${ORG}/pixelpilot`,
    stargazersCount: 1760,
    forksCount: 231,
    openIssuesCount: 26,
    topics: ['design-system', 'accessibility', 'react'],
    language: 'TypeScript',
    pushedAt: '2026-10-19T18:45:00.000Z',
  },
  {
    id: 'r-004',
    fullName: 'gfg-hacktober-fest/snipvault',
    description: 'Snippet manager with semantic search.',
    htmlUrl: `${ORG}/snipvault`,
    stargazersCount: 446,
    forksCount: 128,
    openIssuesCount: 29,
    topics: ['snippets', 'search', 'first-timers'],
    language: 'React',
    pushedAt: '2026-10-18T11:22:00.000Z',
  },
]

export const MOCK_GITHUB_ISSUES: Record<string, GitHubIssue[]> = {
  'p-001': [
    {
      id: 'gi-412',
      number: 412,
      title: 'Retry backoff is ignored on failed webhook deliveries',
      htmlUrl: `${ORG}/codeflow/issues/412`,
      state: 'open',
      labels: [
        { name: 'bug', color: '#d73a49' },
        { name: 'medium', color: '#2f8d46' },
      ],
      comments: 6,
    },
    {
      id: 'gi-418',
      number: 418,
      title: 'Batch job scheduler loads every run into memory',
      htmlUrl: `${ORG}/codeflow/issues/418`,
      state: 'open',
      labels: [
        { name: 'performance', color: '#a2eeef' },
        { name: 'hard', color: '#b60205' },
      ],
      comments: 11,
    },
    {
      id: 'gi-401',
      number: 401,
      title: 'Document the self-hosting guide with Docker Compose',
      htmlUrl: `${ORG}/codeflow/issues/401`,
      state: 'open',
      labels: [
        { name: 'documentation', color: '#0075ca' },
        { name: 'good first issue', color: '#7057ff' },
      ],
      comments: 2,
    },
  ],
}

export const MOCK_PULL_REQUESTS: GitHubPullRequest[] = [
  {
    id: 'pr-431',
    number: 431,
    title: 'fix: anchor run table scroll position during live updates',
    htmlUrl: `${ORG}/codeflow/pull/431`,
    state: 'open',
    author: 'dev_kiran',
    repository: 'codeflow',
    additions: 184,
    deletions: 42,
  },
  {
    id: 'pr-419',
    number: 419,
    title: 'fix: exponential backoff with jitter for webhook retries',
    htmlUrl: `${ORG}/codeflow/pull/419`,
    state: 'merged',
    author: 'dev_kiran',
    repository: 'codeflow',
    additions: 96,
    deletions: 18,
    mergedAt: '2026-10-15T10:20:00.000Z',
  },
  {
    id: 'pr-251',
    number: 251,
    title: 'perf: virtualise diff hunks for large patches',
    htmlUrl: `${ORG}/patchsense/pull/251`,
    state: 'merged',
    author: 'dev_kiran',
    repository: 'patchsense',
    additions: 612,
    deletions: 240,
    mergedAt: '2026-10-18T15:40:00.000Z',
  },
]

export const MOCK_VERIFICATIONS: Record<number, ContributionVerification> = {
  431: {
    pullRequestNumber: 431,
    status: 'review-pending',
    classification: 'ui-ux',
    suggestedXp: 40,
    notes: 'Diff analysed — awaiting maintainer approval.',
    updatedAt: '2026-10-19T17:02:00.000Z',
  },
  419: {
    pullRequestNumber: 419,
    status: 'verified',
    classification: 'bug-fix',
    suggestedXp: 45,
    notes: 'Merged with tests and a linked issue.',
    updatedAt: '2026-10-15T10:25:00.000Z',
  },
  251: {
    pullRequestNumber: 251,
    status: 'verified',
    classification: 'ui-ux',
    suggestedXp: 120,
    notes: 'High-impact performance work with benchmark evidence.',
    updatedAt: '2026-10-18T15:45:00.000Z',
  },
}

/** The pipeline the UI visualises on the "GitHub Integration" sections. */
export const INTEGRATION_PIPELINE = [
  { id: 'github-app', label: 'GitHub App', detail: 'Watches competition repositories' },
  { id: 'webhook', label: 'Webhook', detail: 'PR opened, updated, merged' },
  { id: 'backend', label: 'Backend', detail: 'Express validates the event' },
  { id: 'analysis', label: 'PR Analysis', detail: 'Diff, scope and issue link' },
  { id: 'verification', label: 'Verification', detail: 'Maintainer review recorded' },
  { id: 'scoring', label: 'Points', detail: 'Classification -> XP tier' },
  { id: 'leaderboard', label: 'Leaderboard', detail: 'Ranks and badges refresh' },
] as const
