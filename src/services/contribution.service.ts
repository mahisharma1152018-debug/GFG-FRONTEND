import { MOCK_CONTRIBUTIONS, MOCK_PROGRESS } from '@/data/mock/contributions'
import { MOCK_SCORING_CONFIG } from '@/data/mock/scoring'
import type { CalculatorInput, CalculatorResult, Contribution, ContributionProgress, ScoringConfig } from '@/types'
import { api, isBackendConfigured, mockLatency } from './api'

function mapContribution(c:any):Contribution {
  const merged=Boolean(c.merged)
  return {
    id:String(c.githubPRId ?? c._id ?? c.prNumber),
    title:c.title ?? `Pull request #${c.prNumber}`,
    projectId:String(c.repositoryId ?? c.repositoryFullName ?? ''),
    projectName:c.repositoryFullName ?? '',
    problemStatementId:undefined,
    pullRequestNumber:Number(c.prNumber),
    pullRequestUrl:c.url ?? `https://github.com/${c.repositoryFullName}/pull/${c.prNumber}`,
    contributionType:'feature',
    difficulty:'medium',
    prStatus:merged?'merged':(c.state==='closed'?'closed':c.draft?'draft':'open'),
    reviewStatus:'pending',
    xpAwarded:null,
    submittedAt:c.createdAtGithub ?? c.createdAt ?? new Date().toISOString(),
    mergedAt:c.mergedAt,
    author:{id:String(c.author?.githubId ?? c.author?.username ?? ''),username:c.author?.username ?? '',name:c.author?.name ?? c.author?.username ?? ''},
    summary:c.body ?? '',
  }
}
export async function getContributions(filter?:{userId?:string;projectId?:string;status?:string}):Promise<Contribution[]> {
  if(isBackendConfigured()) {
    return (await api.get<any[]>('/pull-requests',{author:filter?.userId,repo:filter?.projectId,state:filter?.status==='merged'?'merged':undefined})).map(mapContribution)
  }
  await mockLatency(); let list=[...MOCK_CONTRIBUTIONS]
  if(filter?.userId) list=list.filter(c=>c.author.id===filter.userId)
  if(filter?.projectId) list=list.filter(c=>c.projectId===filter.projectId)
  if(filter?.status && filter.status!=='all') list=list.filter(c=>c.prStatus===filter.status)
  return list.sort((a,b)=>Date.parse(b.submittedAt)-Date.parse(a.submittedAt))
}
export async function getContributionProgress(userId?:string):Promise<ContributionProgress[]> {
  if(isBackendConfigured()) return []
  await mockLatency(260); return MOCK_PROGRESS
}
export async function getScoringConfig():Promise<ScoringConfig> { await mockLatency(180); return MOCK_SCORING_CONFIG }
export async function saveScoringConfig(config:ScoringConfig):Promise<ScoringConfig>{ return {...config,updatedAt:new Date().toISOString()} }
const IMPACT_FACTOR:Record<CalculatorInput['impact'],number>={low:.9,moderate:1,high:1.2}
export async function estimateXp(input:CalculatorInput):Promise<CalculatorResult>{
  const config=MOCK_SCORING_CONFIG, tier=config.tiers.find(t=>t.difficulty===input.difficulty)??config.tiers[0], multiplier=config.multipliers.find(m=>m.id===input.quality)??config.multipliers[0], impact=IMPACT_FACTOR[input.impact]
  const scale=(v:number)=>Math.round(v*multiplier.factor*impact)
  return {minXp:scale(tier.minXp),maxXp:scale(tier.maxXp),estimate:Math.round((scale(tier.minXp)+scale(tier.maxXp))/2),multiplierApplied:multiplier.factor*impact,disclaimer:'Estimate only. Final XP is assigned by project maintainers after review and merge.'}
}
