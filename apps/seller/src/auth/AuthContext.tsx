import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthClaims } from '@bizcode/types'
import { isSellerAppRole } from './sellerRoles'
import { loadSessionClaims, loginSeller, logoutSeller } from './session'

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
  if (!isSellerAppRole(claims.role)) return 'forbidden'
  return 'authenticated'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [claims, setClaims] = useState<AuthClaims | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refreshSession = useCallback(async () => {
    setError(null)
    const next = await loadSessionClaims()
    setClaims(next)
    setStatus(statusFromClaims(next))
  }, [])

  useEffect(() => {
    void refreshSession()
  }, [refreshSession])

  const login = useCallback(
    async (input: { tenantSlug: string; username: string; password: string }) => {
      setError(null)
      try {
        const data = await loginSeller(input)
        if (!isSellerAppRole(data.role)) {
          await logoutSeller()
          setClaims(null)
          setStatus('forbidden')
          setError('Acceso solo para vendedor, gerente o propietario.')
          return
        }
        await refreshSession()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'LOGIN_FAILED'
        if (message === 'MFA_REQUIRED') {
          setError('Esta cuenta requiere MFA. Completá el flujo en la app web y volvé a intentar.')
        } else {
          setError('No se pudo iniciar sesión. Verificá tenant, usuario y contraseña.')
        }
        setStatus('anonymous')
        setClaims(null)
        throw err
      }
    },
    [refreshSession],
  )

  const logout = useCallback(async () => {
    await logoutSeller()
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
