import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useParams } from 'react-router-dom'
import { portalAPI, type PortalBranding, type PortalMe } from '@/lib/portalApi'

type PortalAuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

type PortalAuthContextValue = {
  status: PortalAuthStatus
  tenantSlug: string
  branding: PortalBranding | null
  me: PortalMe | null
  refresh: () => Promise<void>
  logout: () => Promise<void>
  setSessionFromVerify: (me: PortalMe) => void
}

const PortalAuthContext = createContext<PortalAuthContextValue | null>(null)

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const { tenantSlug: routeSlug } = useParams<{ tenantSlug: string }>()
  const tenantSlug = routeSlug?.trim() ?? ''
  const [status, setStatus] = useState<PortalAuthStatus>('loading')
  const [branding, setBranding] = useState<PortalBranding | null>(null)
  const [me, setMe] = useState<PortalMe | null>(null)

  const refresh = useCallback(async () => {
    if (!tenantSlug) {
      setStatus('unauthenticated')
      return
    }
    try {
      const brandingData = await portalAPI.getBranding(tenantSlug)
      setBranding(brandingData)
      const session = await portalAPI.getMe(tenantSlug)
      setMe(session.me)
      setBranding(session.branding)
      setStatus('authenticated')
    } catch {
      setMe(null)
      setStatus('unauthenticated')
    }
  }, [tenantSlug])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const logout = useCallback(async () => {
    if (!tenantSlug) return
    try {
      await portalAPI.logout(tenantSlug)
    } finally {
      setMe(null)
      setStatus('unauthenticated')
    }
  }, [tenantSlug])

  const setSessionFromVerify = useCallback((verifiedMe: PortalMe) => {
    setMe(verifiedMe)
    setStatus('authenticated')
  }, [])

  const value = useMemo(
    () => ({
      status,
      tenantSlug,
      branding,
      me,
      refresh,
      logout,
      setSessionFromVerify,
    }),
    [status, tenantSlug, branding, me, refresh, logout, setSessionFromVerify],
  )

  return <PortalAuthContext.Provider value={value}>{children}</PortalAuthContext.Provider>
}

export function usePortalAuth(): PortalAuthContextValue {
  const ctx = useContext(PortalAuthContext)
  if (!ctx) {
    throw new Error('usePortalAuth must be used within PortalAuthProvider')
  }
  return ctx
}
