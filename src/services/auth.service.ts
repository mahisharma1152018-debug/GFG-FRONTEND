import { CURRENT_USER_ID, MOCK_ADMINS, MOCK_USERS } from '@/data/mock/users'
import type { User } from '@/types'
import { api, getApiBaseUrl, isBackendConfigured, mockLatency } from './api'

export interface Session { user: User; provider:'github'|'demo'; accessToken?:string }
const STORAGE_KEY='gfg-hbf.session'
function loadStored():Session|null { try { const raw=localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) as Session : null } catch { return null } }
function persist(s:Session|null){ try { s ? localStorage.setItem(STORAGE_KEY,JSON.stringify(s)) : localStorage.removeItem(STORAGE_KEY) } catch {} }
let memorySession:Session|null=loadStored()
export function getSession(){ return memorySession }

function mapMe(data:any):User {
  return {
    id:String(data.participantId ?? data.githubId ?? data.username),
    username:data.username, name:data.name ?? data.username, role:'participant',
    githubUrl:data.profileUrl ?? `https://github.com/${data.username}`, avatarUrl:data.avatarUrl,
    totalXp:Number(data.points ?? 0), rank:0, mergedPullRequests:0, projectsContributed:0,
    streakDays:0, level:1, joinedAt:new Date().toISOString(), badges:[]
  }
}

export async function refreshSession():Promise<Session|null> {
  if (!isBackendConfigured()) return memorySession
  try {
    const me=await api.get<any>('/auth/me')
    const session:Session={user:mapMe(me),provider:'github'}
    memorySession=session; persist(session); return session
  } catch {
    memorySession=null; persist(null); return null
  }
}

export async function signIn(role:'participant'|'admin'='participant'):Promise<Session> {
  if (isBackendConfigured()) {
    // Backend uses a browser redirect for OAuth; there is no POST callback endpoint.
    window.location.assign(`${getApiBaseUrl()}/api/auth/github`)
    return new Promise<Session>(()=>{})
  }
  await mockLatency(520)
  const user=role==='admin' ? MOCK_ADMINS[0] : (MOCK_USERS.find(u=>u.id===CURRENT_USER_ID) ?? MOCK_USERS[0])
  const session:Session={user,provider:'demo'}; memorySession=session; persist(session); return session
}
export async function signOut(){
  if(isBackendConfigured()) await api.post('/auth/logout').catch(()=>undefined)
  memorySession=null; persist(null)
}
export function isAuthenticated(){ return memorySession!==null }
