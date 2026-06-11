import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { portalConfigAPI } from '@/lib/portalApi'
import { useAuth } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/rbac'

/**
 * @en Tenant admin portal branding and toggles (#240).
 * @es Configuración de branding y secciones del portal (#240).
 * @pt-BR Configuração de branding e seções do portal (#240).
 */
export default function PortalConfigSection() {
  const { t } = useTranslation('portal')
  const { claims } = useAuth()
  const canManage = hasPermission(claims?.role ?? 'seller', 'settings.business.manage')
  const [enabled, setEnabled] = useState(false)
  const [showPedidos, setShowPedidos] = useState(true)
  const [logoUrl, setLogoUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#2563eb')
  const [footerText, setFooterText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await portalConfigAPI.get()
      setEnabled(data.enabled)
      setShowPedidos(data.showPedidos)
      setLogoUrl(data.logoUrl ?? '')
      setPrimaryColor(data.primaryColor ?? '#2563eb')
      setFooterText(data.footerText ?? '')
    } catch {
      setError(t('config.error'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (canManage) {
      void load()
    } else {
      setLoading(false)
    }
  }, [canManage, load])

  if (!canManage) {
    return null
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      await portalConfigAPI.update({
        enabled,
        showPedidos,
        logoUrl: logoUrl.trim() || null,
        primaryColor: primaryColor.trim() || null,
        footerText: footerText.trim() || null,
      })
      setMessage(t('config.saved'))
    } catch {
      setError(t('config.error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section
      className="mt-8 rounded-lg border border-slate-200 p-6 dark:border-slate-700"
      aria-labelledby="portal-config-title"
      data-testid="portal-config-section"
    >
      <h2 id="portal-config-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {t('config.title')}
      </h2>
      {claims?.tenantId ? (
        <p className="mt-1 text-sm text-slate-500">{t('config.portalUrlHint', { slug: '…' })}</p>
      ) : null}

      {loading ? (
        <p className="mt-4 text-sm text-slate-600" role="status" aria-busy="true">
          …
        </p>
      ) : (
        <form onSubmit={(e) => void handleSave(e)} className="mt-4 space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              data-testid="portal-config-enabled"
            />
            <span>{t('config.enabled')}</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showPedidos}
              onChange={(e) => setShowPedidos(e.target.checked)}
              data-testid="portal-config-show-pedidos"
            />
            <span>{t('config.showPedidos')}</span>
          </label>
          <div>
            <label htmlFor="portal-config-logo" className="mb-1 block text-sm font-medium">
              {t('config.logoUrl')}
            </label>
            <input
              id="portal-config-logo"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
          </div>
          <div>
            <label htmlFor="portal-config-color" className="mb-1 block text-sm font-medium">
              {t('config.primaryColor')}
            </label>
            <input
              id="portal-config-color"
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
          <div>
            <label htmlFor="portal-config-footer" className="mb-1 block text-sm font-medium">
              {t('config.footerText')}
            </label>
            <textarea
              id="portal-config-footer"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              rows={2}
              className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
          </div>
          {message ? (
            <p className="text-sm text-green-700" role="status" aria-live="polite">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="text-sm text-red-600" role="alert" aria-live="assertive">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            data-testid="portal-config-save"
          >
            {saving ? t('config.saving') : t('config.save')}
          </button>
        </form>
      )}
    </section>
  )
}
