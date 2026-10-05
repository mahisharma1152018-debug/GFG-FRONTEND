import { MOCK_BADGES } from '@/data/mock/badges'
import { MOCK_USERS } from '@/data/mock/users'
import type { Badge } from '@/types'
import { api, isBackendConfigured, mockLatency } from './api'

function mapBadge(b:any, unlocked=false):Badge {
  return {
    id:b.key ?? b._id ?? b.id, name:b.name ?? b.key, description:b.description ?? '',
    icon:'award', requirement:b.condition ? `${b.condition.metric ?? 'metric'} ${b.condition.operator ?? '>='} ${b.condition.value ?? ''}` : '',
    rarity:b.type === 'RANK' ? 'legendary' : 'common', xpReward:0, unlocked,
    unlockedAt:b.earnedAt, progress:undefined,
  }
}
export async function getBadges():Promise<Badge[]> {
  if(isBackendConfigured()) return (await api.get<any[]>('/badges')).map(b=>mapBadge(b))
  await mockLatency(); return MOCK_BADGES
}
export async function getUserBadges(userId:string):Promise<Badge[]> {
  if(isBackendConfigured()) {
    // Backend expects a Mongo participant id, which is also what auth/me exposes.
    return (await api.get<any[]>(`/badges/participant/${encodeURIComponent(userId)}`)).map(b=>mapBadge(b,true))
  }
  await mockLatency(220)
  const user=MOCK_USERS.find(u=>u.id===userId)
  return MOCK_BADGES.map(b=>({...b,unlocked:b.unlocked && (user ? user.badges.includes(b.id) : true)}))
}
export async function getRecentlyUnlocked(limit=4):Promise<Badge[]> {
  const badges=await getBadges(); return badges.filter(b=>b.unlocked).slice(0,limit)
}
