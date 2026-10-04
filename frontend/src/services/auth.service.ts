import { CURRENT_USER_ID, MOCK_ADMINS, MOCK_USERS } from '@/data/mock/users'
import type { User } from '@/types'
import { api, isBackendConfigured, mockLatency } from './api'

/**
 * Session handling.
 *
 * Only the shape of GitHub OAuth is anticipated here — no real OAuth flow is
 * implemented. TODO: Connect authentication (GitHub OAuth via backend).
 */

export interface Session {
  user: User
  provider: 'github' | 'demo'
  accessToken?: string
}

const STORAGE_KEY = 'gfg-hbf.session'

function loadStored(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

function persist(session: Session | null): void {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage unavailable (private mode) — session stays in memory */
  }
}

let memorySession: Session | null = loadStored()

export function getSession(): Session | null {
  return memorySession
}

export async function signIn(role: 'participant' | 'admin' = 'participant'): Promise<Session> {
  if (isBackendConfigured()) {
    // TODO: Connect authentication — exchange the GitHub code for a session.
    const session = await api.post<Session>('/auth/github/callback', { role })
    memorySession = session
    persist(session)
    return session
  }

  await mockLatency(520)
  const user =
    role === 'admin'
      ? MOCK_ADMINS[0]
      : (MOCK_USERS.find((u) => u.id === CURRENT_USER_ID) ?? MOCK_USERS[0])

  const session: Session = { user, provider: 'demo' }
  memorySession = session
  persist(session)
  return session
}

export async function signOut(): Promise<void> {
  if (isBackendConfigured()) {
    await api.post('/auth/logout').catch(() => undefined)
  }
  memorySession = null
  persist(null)
}

export function isAuthenticated(): boolean {
  return memorySession !== null
}
