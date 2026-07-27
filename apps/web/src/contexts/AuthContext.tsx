import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authAPI, isLoginMfaChallenge } from '@/lib/api'
import type { AuthClaims } from '@/lib/rbac'

export type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated'

export type LoginOutcome =
  | { status: 'authenticated' }
  | { status: 'mfa_required'; mfaToken: string }

type AuthContextValue = {
  status: AuthStatus
  claims: AuthClaims | null
  login: (credentials: {
    tenantSlug: string
    username: string
    password: string
    rememberMe?: boolean
  }) => Promise<LoginOutcome>
  verifyMfa: (mfaToken: string, code: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * @en Provides session state from `/api/auth/me` and login/logout helpers (cookie session).
 * @es Expone el estado de sesión vía `/api/auth/me` y helpers de login/logout (cookie).
 * @pt-BR Expõe estado de sessão via `/api/auth/me` e helpers de login/logout (cookie).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [claims, setClaims] = useState<AuthClaims | null>(null)

  const refresh = useCallback(async () => {
    try {
      const data = await authAPI.me()
      setClaims(data)
      setStatus('authenticated')
    } catch {
      setClaims(null)
      setStatus('unauthenticated')
    }
  }, [])

  useEffect(() => {
    /** Defer session probe so setState runs outside the effect tick (react-hooks/set-state-in-effect). */
    const id = window.setTimeout(() => {
      void refresh()
    }, 0)
    return () => window.clearTimeout(id)
  }, [refresh])

  const login = useCallback(
    async (credentials: {
      tenantSlug: string
      username: string
      password: string
      rememberMe?: boolean
    }): Promise<LoginOutcome> => {
      const result = await authAPI.login(credentials)
      if (isLoginMfaChallenge(result)) {
        return { status: 'mfa_required', mfaToken: result.mfaToken }
      }
      await refresh()
      return { status: 'authenticated' }
    },
    [refresh],
  )

  const verifyMfa = useCallback(
    async (mfaToken: string, code: string) => {
      await authAPI.verifyMfa({ mfaToken, code })
      await refresh()
    },
    [refresh],
  )

  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch {
      // Still clear local state so the UI can recover if the cookie was already gone.
    }
    setClaims(null)
    setStatus('unauthenticated')
  }, [])

  const value = useMemo(
    () => ({ status, claims, login, verifyMfa, logout, refresh }),
    [status, claims, login, verifyMfa, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
