import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getSession, signIn, signOut } from '@/services/auth.service'
import type { Session } from '@/services/auth.service'
import type { User, UserRole } from '@/types'

/**
 * Mock authentication context.
 * TODO: Connect authentication — swap signIn() for the GitHub OAuth flow.
 */

interface AuthContextValue {
  session: Session | null
  user: User | null
  isAuthenticated: boolean
  role: UserRole | null
  login: (role?: UserRole) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Session is rehydrated synchronously from storage on first render.
  // TODO: Connect authentication — replace with the backend session query.
  const [session, setSession] = useState<Session | null>(() => getSession())

  const login = useCallback(async (role: UserRole = 'participant') => {
    const next = await signIn(role)
    setSession(next)
  }, [])

  const logout = useCallback(async () => {
    await signOut()
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: session !== null,
      role: session?.user.role ?? null,
      login,
      logout,
    }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
