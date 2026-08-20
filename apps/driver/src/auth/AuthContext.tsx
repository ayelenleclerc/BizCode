import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { AuthClaims } from '@bizcode/types'
import { isDriverAppRole } from './driverRoles'
import { loadSessionClaims, loginDriver, logoutDriver } from './session'
import { registerDriverPushToken, unregisterDriverPushToken } from '../push/registerPush'

export type AuthStatus = 'loading' | 'anonymous' | 'authenticated' | 'forbidden'

type AuthContextValue = {
  status: AuthStatus
  claims: AuthClaims | null
  error: string | null
  login: (input: { tenantSlug: string; username: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function statusFromClaims(claims: AuthClaims | null): AuthStatus {
  if (!claims) return 'anonymous'
  if (!isDriverAppRole(claims.role)) return 'forbidden'
  return 'authenticated'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation('common')
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [claims, setClaims] = useState<AuthClaims | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pushTokenRef = useRef<string | null>(null)

  const refreshSession = useCallback(async () => {
    setError(null)
    const next = await loadSessionClaims()
    setClaims(next)
    const nextStatus = statusFromClaims(next)
    setStatus(nextStatus)
    if (nextStatus === 'authenticated') {
      try {
        pushTokenRef.current = await registerDriverPushToken()
      } catch {
        /* permissions / Expo token optional in web/dev */
      }
    }
  }, [])

  useEffect(() => {
    void refreshSession()
  }, [refreshSession])

  const login = useCallback(
    async (input: { tenantSlug: string; username: string; password: string }) => {
      setError(null)
      try {
        const data = await loginDriver(input)
        if (!isDriverAppRole(data.role)) {
          await logoutDriver()
          setClaims(null)
          setStatus('forbidden')
          setError(t('login.roleDenied'))
          return
        }
        await refreshSession()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'LOGIN_FAILED'
        if (message === 'MFA_REQUIRED') {
          setError(t('login.mfaHint'))
        } else {
          setError(t('login.failed'))
        }
        setStatus('anonymous')
        setClaims(null)
        throw err
      }
    },
    [refreshSession, t],
  )

  const logout = useCallback(async () => {
    await unregisterDriverPushToken(pushTokenRef.current)
    pushTokenRef.current = null
    await logoutDriver()
    setClaims(null)
    setStatus('anonymous')
    setError(null)
  }, [])

  const value = useMemo(
    () => ({ status, claims, error, login, logout, refreshSession }),
    [status, claims, error, login, logout, refreshSession],
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
