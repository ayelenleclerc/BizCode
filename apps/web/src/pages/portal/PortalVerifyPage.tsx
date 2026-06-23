import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { portalAPI } from '@/lib/portalApi'
import { usePortalAuth } from '@/contexts/PortalAuthContext'

export default function PortalVerifyPage() {
  const { t } = useTranslation('portal')
  const { tenantSlug, setSessionFromVerify, status } = usePortalAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const token = searchParams.get('token') ?? ''
  const missingTokenError = !token.trim() ? t('verify.missingToken') : null

  useEffect(() => {
    if (missingTokenError) {
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const data = await portalAPI.verifyToken(tenantSlug, token)
        if (cancelled) return
        setSessionFromVerify(data.me)
        navigate(`/portal/${tenantSlug}/facturas`, { replace: true })
      } catch {
        if (!cancelled) {
          setVerifyError(t('verify.invalidToken'))
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [missingTokenError, token, tenantSlug, setSessionFromVerify, navigate, t])

  if (status === 'authenticated') {
    return <Navigate to={`/portal/${tenantSlug}/facturas`} replace />
  }

  const error = missingTokenError ?? verifyError
  if (error) {
    return (
      <div
        className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800"
        role="alert"
        data-testid="portal-verify-error"
      >
        {error}
      </div>
    )
  }

  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-busy="true">
      <p className="text-slate-700 dark:text-slate-300">{t('verify.loading')}</p>
    </div>
  )
}
