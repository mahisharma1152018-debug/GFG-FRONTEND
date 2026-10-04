/**
 * Domain model for GFG Hacktober Fest.
 *
 * Every shape here is the contract the Express/MongoDB backend will return,
 * so UI components only ever depend on these types (never on mock data).
 */

export type Difficulty = 'easy' | 'medium' | 'hard'

export type ProjectStatus = 'active' | 'upcoming' | 'completed' | 'archived'

export type ContributionType =
  | 'bug-fix'
  | 'feature'
  | 'ui-ux'
  | 'documentation'
  | 'performance'
  | 'testing'
  | 'refactor'
  | 'integration'

export type PullRequestStatus = 'open' | 'draft' | 'in-review' | 'merged' | 'closed'

export type ReviewStatus = 'pending' | 'approved' | 'changes-requested' | 'rejected'

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary'

export type UserRole = 'participant' | 'admin'

export type ProjectCategory =
  | 'Developer Tools'
  | 'Education'
  | 'AI Tools'
  | 'Web Applications'
  | 'Open Source Utilities'
  | 'Productivity'
  | 'Backend Services'
  | 'UI Libraries'
  | 'Developer Experience'
  | 'Community Tools'

/* ------------------------------------------------------------------ users */

export interface User {
  id: string
  username: string
  name: string
  role: UserRole
  bio?: string
  college?: string
  team?: string
  githubUrl: string
  avatarUrl?: string
  totalXp: number
  rank: number
  mergedPullRequests: number
  projectsContributed: number
  streakDays: number
  level: number
  joinedAt: string
  badges: string[]
}

export type LeaderboardScope = 'overall' | 'weekly' | 'project'

export interface LeaderboardEntry {
  rank: number
  previousRank?: number
  user: Pick<
    User,
    'id' | 'username' | 'name' | 'githubUrl' | 'avatarUrl' | 'college' | 'team'
  >
  xp: number
  mergedPullRequests: number
  projectsContributed: number
  badges: string[]
}

/* ---------------------------------------------------------------- projects */

export interface Project {
  id: string
  name: string
  slug: string
  tagline: string
  description: string
  repositoryUrl: string
  homepageUrl?: string
  admin: { name: string; username: string; githubUrl: string }
  technologies: string[]
  difficulty: Difficulty
  status: ProjectStatus
  category: ProjectCategory
  tags: string[]
  featured: boolean
  openIssues: number
  slotsAvailable: number
  slotsTotal: number
  potentialXpMin: number
  potentialXpMax: number
  stars: number
  forks: number
  createdAt: string
  guidelines: string[]
  requirements: string[]
}

export interface ProblemStatement {
  id: string
  projectId: string
  title: string
  description: string
  githubIssueUrl: string
  difficulty: Difficulty
  contributionType: ContributionType
  technology: string
  expectedXpMin: number
  expectedXpMax: number
  status: 'open' | 'claimed' | 'in-progress' | 'resolved'
  deadline?: string
  requirements: string[]
  submittedBy?: string
}

/* ----------------------------------------------------------- contributions */

export interface Contribution {
  id: string
  title: string
  projectId: string
  projectName: string
  problemStatementId?: string
  pullRequestNumber: number
  pullRequestUrl: string
  contributionType: ContributionType
  difficulty: Difficulty
  prStatus: PullRequestStatus
  reviewStatus: ReviewStatus
  xpAwarded: number | null
  submittedAt: string
  mergedAt?: string
  author: Pick<User, 'id' | 'username' | 'name'>
  summary: string
}

export type ProgressStage =
  | 'issue-selected'
  | 'forked'
  | 'development'
  | 'pr-submitted'
  | 'review'
  | 'merged'
  | 'points-awarded'

export interface ContributionProgress {
  contributionId: string
  title: string
  projectName: string
  stages: { stage: ProgressStage; completedAt?: string }[]
  currentStage: ProgressStage
  updatedAt: string
}

/* ------------------------------------------------------------------ badges */

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  image?: string
  requirement: string
  rarity: BadgeRarity
  xpReward: number
  unlocked: boolean
  unlockedAt?: string
  progress?: { current: number; target: number }
}

/* --------------------------------------------------------------- scoring */

export interface DifficultyTier {
  difficulty: Difficulty
  label: string
  minXp: number
  maxXp: number
  examples: string[]
}

export interface QualityMultiplier {
  id: string
  label: string
  factor: number
  description: string
}

export interface ScoringConfig {
  tiers: DifficultyTier[]
  multipliers: QualityMultiplier[]
  /** Master switch rules enforced by the backend before XP is awarded. */
  requirements: { id: string; label: string; description: string; mandatory: boolean }[]
  version: string
  updatedAt: string
}

export interface CalculatorInput {
  contributionType: ContributionType
  difficulty: Difficulty
  impact: 'low' | 'moderate' | 'high'
  quality: string
}

export interface CalculatorResult {
  minXp: number
  maxXp: number
  estimate: number
  multiplierApplied: number
  disclaimer: string
}

/* ------------------------------------------------------------------- stats */

export interface EventStats {
  id: string
  label: string
  value: number
  suffix: string
  hint: string
}

export interface PlatformAnalytics {
  totalParticipants: number
  activeContributors: number
  totalProjects: number
  openIssues: number
  pullRequestsSubmitted: number
  pullRequestsMerged: number
  totalXpAwarded: number
  contributionsOverTime: { date: string; contributions: number; xp: number }[]
  difficultyDistribution: { difficulty: Difficulty; count: number }[]
  projectActivity: { name: string; contributions: number; xp: number }[]
  xpDistribution: { range: string; participants: number }[]
}

/* ----------------------------------------------------------------- github */

export interface GitHubRepository {
  id: string
  fullName: string
  description: string
  htmlUrl: string
  stargazersCount: number
  forksCount: number
  openIssuesCount: number
  topics: string[]
  language: string
  pushedAt: string
}

export interface GitHubIssue {
  id: string
  number: number
  title: string
  htmlUrl: string
  state: 'open' | 'closed'
  labels: { name: string; color: string }[]
  comments: number
}

export interface GitHubPullRequest {
  id: string
  number: number
  title: string
  htmlUrl: string
  state: 'open' | 'closed' | 'merged'
  author: string
  repository: string
  additions: number
  deletions: number
  mergedAt?: string
}

export interface ContributionVerification {
  pullRequestNumber: number
  status: 'detected' | 'analyzing' | 'review-pending' | 'verified' | 'rejected'
  classification?: ContributionType
  suggestedXp?: number
  notes?: string
  updatedAt: string
}

/* ------------------------------------------------------------ pagination */

export interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export interface ProjectFilters {
  search?: string
  category?: ProjectCategory | 'all'
  difficulty?: Difficulty | 'all'
  technology?: string
  contributionType?: ContributionType | 'all'
  availability?: 'all' | 'slots'
  sort?: 'trending' | 'points' | 'difficulty' | 'newest' | 'open-issues'
  page?: number
  pageSize?: number
}
