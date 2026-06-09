import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CanAccess } from '@/components/CanAccess'
import { documentosCompraAPI, type DocumentoCompraTemplateSummaryDTO } from '@/lib/api'

/**
 * @en Tenant YAML template management for purchase document extraction (#277 Fase G).
 * @es Gestión de plantillas YAML del tenant para extracción de documentos (#277 Fase G).
 * @pt-BR Gestão de templates YAML do tenant para extração de documentos (#277 Fase G).
 */
export default function DocumentoCompraTemplatesSection() {
  const { t } = useTranslation('finanzas')
  const [templates, setTemplates] = useState<DocumentoCompraTemplateSummaryDTO[]>([])
  const [yamlContent, setYamlContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await documentosCompraAPI.listTemplates()
      setTemplates(list)
    } catch {
      setError(t('documentoCompra.templates.loadFailed'))
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadTemplates()
  }, [loadTemplates])

  const handleSave = async () => {
    if (yamlContent.trim().length < 20) {
      setError(t('documentoCompra.templates.contentTooShort'))
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const saved = await documentosCompraAPI.saveTemplate(yamlContent)
      setSuccess(t('documentoCompra.templates.saved', { issuer: saved.issuer }))
      setYamlContent('')
      await loadTemplates()
    } catch {
      setError(t('documentoCompra.templates.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <CanAccess permission="settings.fiscal.manage">
      <section
        className="mt-8 border-t border-slate-200 dark:border-slate-600 pt-6"
        data-testid="documento-compra-templates-section"
      >
        <h3 className="text-base font-semibold mb-2">{t('documentoCompra.templates.title')}</h3>
        <p className="text-sm text-slate-500 mb-4">{t('documentoCompra.templates.hint')}</p>

        {loading ? (
          <p className="text-sm text-slate-500" data-testid="documento-compra-templates-loading">
            {t('documentoCompra.templates.loading')}
          </p>
        ) : (
          <ul className="text-sm mb-4 space-y-1" data-testid="documento-compra-templates-list">
            {templates.map((tpl) => (
              <li key={tpl.issuer} className="font-mono text-xs">
                {tpl.issuer}{' '}
                <span className="text-slate-500">
                  ({tpl.source === 'bundled' ? t('documentoCompra.templates.bundled') : t('documentoCompra.templates.custom')})
                </span>
              </li>
            ))}
          </ul>
        )}

        <label htmlFor="documento-compra-template-yaml" className="block text-sm mb-1">
          {t('documentoCompra.templates.yamlLabel')}
        </label>
        <textarea
          id="documento-compra-template-yaml"
          rows={10}
          className="w-full font-mono text-xs rounded border px-2 py-1 bg-white dark:bg-slate-800"
          value={yamlContent}
          onChange={(e) => setYamlContent(e.target.value)}
          disabled={saving}
          data-testid="documento-compra-template-yaml"
          placeholder={t('documentoCompra.templates.yamlPlaceholder')}
        />

        {error ? (
          <p role="alert" className="mt-2 text-sm text-red-600" data-testid="documento-compra-templates-error">
            {error}
          </p>
        ) : null}
        {success ? (
          <p role="status" className="mt-2 text-sm text-green-700 dark:text-green-400" data-testid="documento-compra-templates-success">
            {success}
          </p>
        ) : null}

        <button
          type="button"
          className="mt-3 px-4 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-50"
          onClick={() => void handleSave()}
          disabled={saving}
          data-testid="documento-compra-template-save"
        >
          {saving ? t('documentoCompra.templates.saving') : t('documentoCompra.templates.save')}
        </button>
      </section>
    </CanAccess>
  )
}
