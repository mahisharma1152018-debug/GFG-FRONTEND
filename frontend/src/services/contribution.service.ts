import { MOCK_CONTRIBUTIONS, MOCK_PROGRESS } from '@/data/mock/contributions'
import { MOCK_SCORING_CONFIG } from '@/data/mock/scoring'
import type {
  CalculatorInput,
  CalculatorResult,
  Contribution,
  ContributionProgress,
  ScoringConfig,
} from '@/types'
import { api, isBackendConfigured, mockLatency } from './api'

/**
 * Contributions, progress tracking and scoring.
 * TODO: Connect GET /contributions, GET /users/:id/progress,
 *       GET /scoring and PUT /admin/scoring.
 */

export async function getContributions(filter?: {
  userId?: string
  projectId?: string
  status?: string
}): Promise<Contribution[]> {
  if (isBackendConfigured()) {
    return api.get<Contribution[]>('/contributions', { ...filter })
  }

  await mockLatency()
  let list = [...MOCK_CONTRIBUTIONS]
  if (filter?.userId) list = list.filter((c) => c.author.id === filter.userId)
  if (filter?.projectId) list = list.filter((c) => c.projectId === filter.projectId)
  if (filter?.status && filter.status !== 'all') {
    list = list.filter((c) => c.prStatus === filter.status)
  }
  return list.sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt))
}

export async function getContributionProgress(userId?: string): Promise<ContributionProgress[]> {
  if (isBackendConfigured()) {
    return api.get<ContributionProgress[]>('/progress', { userId })
  }
  await mockLatency(260)
  return MOCK_PROGRESS
}

export async function getScoringConfig(): Promise<ScoringConfig> {
  if (isBackendConfigured()) {
    return api.get<ScoringConfig>('/scoring')
  }
  await mockLatency(180)
  return MOCK_SCORING_CONFIG
}

export async function saveScoringConfig(config: ScoringConfig): Promise<ScoringConfig> {
  if (isBackendConfigured()) {
    return api.put<ScoringConfig>('/admin/scoring', config)
  }
  // TODO: Connect admin CRUD API — mock persists for the session only.
  await mockLatency(420)
  return { ...config, updatedAt: new Date().toISOString() }
}

const IMPACT_FACTOR: Record<CalculatorInput['impact'], number> = {
  low: 0.9,
  moderate: 1,
  high: 1.2,
}

/**
 * Estimated XP calculator.
 * The number shown is always an *estimate* — the authoritative award comes
 * from the backend after the PR is reviewed and merged.
 */
export async function estimateXp(input: CalculatorInput): Promise<CalculatorResult> {
  if (isBackendConfigured()) {
    return api.post<CalculatorResult>('/scoring/estimate', input)
  }

  await mockLatency(220)
  const config = MOCK_SCORING_CONFIG
  const tier = config.tiers.find((t) => t.difficulty === input.difficulty) ?? config.tiers[0]
  const multiplier = config.multipliers.find((m) => m.id === input.quality) ?? config.multipliers[0]
  const impact = IMPACT_FACTOR[input.impact]

  const scale = (value: number) => Math.round(value * multiplier.factor * impact)

  return {
    minXp: scale(tier.minXp),
    maxXp: scale(tier.maxXp),
    estimate: Math.round((scale(tier.minXp) + scale(tier.maxXp)) / 2),
    multiplierApplied: multiplier.factor * impact,
    disclaimer:
      'Estimate only. Final XP is assigned by project maintainers after review and merge, using the live scoring configuration.',
  }
}
