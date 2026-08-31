import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import KeyboardHint, { useFormShortcuts } from '@/components/shared/KeyboardHint'
import { useTranslation } from 'react-i18next'
import { ApiRequestFailedError, proveedoresAPI, type ProveedorInputDTO } from '@/lib/api'
import { formatTaxId, validateCBU, validateTaxId } from '@/lib/validators'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import { FISCAL_JURISDICTIONS } from '@bizcode/types'
import type { Proveedor, ProveedorCategoria, ProveedorCondicionPago, ProveedorTipoCuenta } from '@bizcode/types'
import ProveedorCatalogoSection from './ProveedorCatalogoSection'
import ProveedorCuentaCorrienteSection from './ProveedorCuentaCorrienteSection'
import ProveedorHistorialSection from './ProveedorHistorialSection'

const COND_IVA = ['RI', 'Mono', 'CF', 'Exento'] as const
const TIPOS_CUENTA: ProveedorTipoCuenta[] = ['cc', 'ca']
const CONDICIONES_PAGO: ProveedorCondicionPago[] = ['contado', '15dias', '30dias', '60dias', 'otro']
const CATEGORIAS: ProveedorCategoria[] = ['materia_prima', 'insumos', 'servicios', 'logistica']

type ProveedorFormProps = {
  proveedorId: number | null
  onClose: () => void
  onSaved: () => void
}

function parseOptionalNumber(value: string): number | null {
  const t = value.trim()
  if (t === '') return null
  const n = Number.parseFloat(t)
  return Number.isFinite(n) ? n : null
}

function ProveedorDatosFormShell({
  wrapAsTabPanel,
  activeTab,
  onSubmit,
  children,
}: {
  wrapAsTabPanel: boolean
  activeTab: 'datos' | 'catalogo' | 'cc' | 'historial'
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  children: ReactNode
}) {
  const form = (
    <form className="space-y-4" onSubmit={onSubmit}>
      {children}
    </form>
  )
  if (!wrapAsTabPanel) {
    return form
  }
  return (
    <div
      role="tabpanel"
      id="proveedor-tabpanel-datos"
      aria-labelledby="proveedor-tab-datos"
      hidden={activeTab !== 'datos'}
      data-testid="proveedor-tabpanel-datos"
    >
      {form}
    </div>
  )
}

/**
 * @en Full supplier profile form with collapsible sections (#269).
 * @es Formulario de ficha de proveedor con secciones colapsables (#269).
 * @pt-BR FormulÃ¡rio de ficha de fornecedor com seÃ§Ãµes recolhÃ­veis (#269).
 */
export default function ProveedorForm({ proveedorId, onClose, onSaved }: ProveedorFormProps) {
  const { t } = useTranslation('proveedores')
  const { t: tc } = useTranslation('common')
  // JurisdicciÃ³n fiscal del tenant: elige el algoritmo del identificador (#207).
  const { jurisdiccionFiscal } = useFeatureFlags()
  const taxIdKind = FISCAL_JURISDICTIONS[jurisdiccionFiscal].taxIdKind
  const [loading, setLoading] = useState(proveedorId != null)
  const [formCodigo, setFormCodigo] = useState('')
  const [formRsocial, setFormRsocial] = useState('')
  const [formFantasia, setFormFantasia] = useState('')
  const [formCuit, setFormCuit] = useState('')
  const [formCondIva, setFormCondIva] = useState<(typeof COND_IVA)[number]>('RI')
  const [formTelef, setFormTelef] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formActivo, setFormActivo] = useState(true)
  const [formCbu, setFormCbu] = useState('')
  const [formAlias, setFormAlias] = useState('')
  const [formBanco, setFormBanco] = useState('')
  const [formTipoCuenta, setFormTipoCuenta] = useState<ProveedorTipoCuenta | ''>('')
  const [formMoneda, setFormMoneda] = useState('ARS')
  const [formCondicionPago, setFormCondicionPago] = useState<ProveedorCondicionPago | ''>('')
  const [formPlazoHabitual, setFormPlazoHabitual] = useState('')
  const [formDescuentoPct, setFormDescuentoPct] = useState('')
  const [formLimiteCredito, setFormLimiteCredito] = useState('')
  const [formCategoria, setFormCategoria] = useState<ProveedorCategoria | ''>('')
  const [formContactoNombre, setFormContactoNombre] = useState('')
  const [formContactoEmail, setFormContactoEmail] = useState('')
  const [formContactoTel, setFormContactoTel] = useState('')
  const [formNotas, setFormNotas] = useState('')
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'datos' | 'catalogo' | 'cc' | 'historial'>('datos')

  const applyProveedor = useCallback((p: Proveedor) => {
    setFormCodigo(String(p.codigo))
    setFormRsocial(p.rsocial)
    setFormFantasia(p.fantasia ?? '')
    setFormCuit(p.cuit ?? '')
    setFormCondIva((COND_IVA.includes(p.condIva as (typeof COND_IVA)[number]) ? p.condIva : 'RI') as (typeof COND_IVA)[number])
    setFormTelef(p.telef ?? '')
    setFormEmail(p.email ?? '')
    setFormActivo(p.activo)
    setFormCbu(p.cbu ?? '')
    setFormAlias(p.alias ?? '')
    setFormBanco(p.banco ?? '')
    setFormTipoCuenta(p.tipoCuenta ?? '')
    setFormMoneda(p.moneda ?? 'ARS')
    setFormCondicionPago(p.condicionPago ?? '')
    setFormPlazoHabitual(p.plazoHabitual != null ? String(p.plazoHabitual) : '')
    setFormDescuentoPct(p.descuentoPct != null ? String(p.descuentoPct) : '')
    setFormLimiteCredito(p.limiteCredito != null ? String(p.limiteCredito) : '')
    setFormCategoria(p.categoria ?? '')
    setFormContactoNombre(p.contactoNombre ?? '')
    setFormContactoEmail(p.contactoEmail ?? '')
    setFormContactoTel(p.contactoTel ?? '')
    setFormNotas(p.notas ?? '')
  }, [])

  useEffect(() => {
    if (proveedorId == null) {
      setLoading(false)
      return
    }
    setLoading(true)
    void proveedoresAPI
      .get(proveedorId)
      .then((data) => {
        if (data) applyProveedor(data as Proveedor)
      })
      .catch(() => {
        setFormError(t('form.errors.loadFailed'))
      })
      .finally(() => setLoading(false))
  }, [proveedorId, applyProveedor, t])

  const validateClient = (): boolean => {
    const errs: Record<string, string> = {}
    const codigo = Number.parseInt(formCodigo, 10)
    if (!Number.isInteger(codigo) || codigo < 1) {
      errs.codigo = t('form.errors.codigoInvalid')
    }
    if (formRsocial.trim().length < 3) {
      errs.rsocial = t('form.errors.rsocialInvalid')
    }
    const cuitTrim = formCuit.trim()
    if (cuitTrim && !validateTaxId(cuitTrim, jurisdiccionFiscal)) {
      errs.cuit = t(`form.taxId.${jurisdiccionFiscal}.invalid`)
    }
    const cbuTrim = formCbu.trim()
    if (cbuTrim && !validateCBU(cbuTrim)) {
      errs.cbu = t('form.errors.cbuInvalid')
    }
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const buildBody = (): ProveedorInputDTO => {
    const codigo = Number.parseInt(formCodigo, 10)
    const body: ProveedorInputDTO = {
      codigo,
      rsocial: formRsocial.trim(),
      condIva: formCondIva,
      activo: formActivo,
      fantasia: formFantasia.trim() || null,
      cuit: formCuit.trim()
        ? formatTaxId(formCuit.trim().replace(/[-\s]/g, ''), jurisdiccionFiscal)
        : null,
      telef: formTelef.trim() || null,
      email: formEmail.trim() || null,
      moneda: formMoneda.trim() || 'ARS',
      cbu: formCbu.trim() ? formCbu.replace(/\D/g, '') : null,
      alias: formAlias.trim() || null,
      banco: formBanco.trim() || null,
      tipoCuenta: formTipoCuenta || null,
      condicionPago: formCondicionPago || null,
      plazoHabitual: parseOptionalNumber(formPlazoHabitual),
      descuentoPct: parseOptionalNumber(formDescuentoPct),
      limiteCredito: parseOptionalNumber(formLimiteCredito),
      categoria: formCategoria || null,
      contactoNombre: formContactoNombre.trim() || null,
      contactoEmail: formContactoEmail.trim() || null,
      contactoTel: formContactoTel.trim() || null,
      notas: formNotas.trim() || null,
    }
    return body
  }

  const submitForm = async () => {
    if (!validateClient()) return
    setFormSaving(true)
    setFormError(null)
    try {
      const body = buildBody()
      if (proveedorId != null) {
        await proveedoresAPI.update(proveedorId, body)
      } else {
        await proveedoresAPI.create(body)
      }
      onSaved()
      onClose()
    } catch (error) {
      if (error instanceof ApiRequestFailedError) {
        setFormError(error.message)
      } else {
        setFormError(t('form.errors.generic'))
      }
    } finally {
      setFormSaving(false)
    }
  }

  useHotkeys('f5', () => {
    void submitForm()
  })

  useHotkeys('escape', () => {
    onClose()
  })

  const inputClass =
    'w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
  const formShortcuts = useFormShortcuts()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-testid="proveedor-form-overlay"
    >
      <button
        type="button"
        className="absolute inset-0 h-full w-full bg-black/50"
        aria-label={tc('actions.cancel')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="proveedor-form-title"
        data-testid="dialog-proveedor-form"
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-6 shadow-xl text-slate-900 dark:text-slate-100"
      >
        <h2 id="proveedor-form-title" className="text-xl font-semibold mb-2">
          {proveedorId != null ? t('form.titleEdit', { codigo: formCodigo || 'â€¦' }) : t('form.titleNew')}
        </h2>
        <p className="text-xs text-slate-500 mb-4">{t('form.hint')}</p>
        <KeyboardHint shortcuts={formShortcuts} className="mb-4" />
        {proveedorId != null && !loading ? (
          <div
            role="tablist"
            aria-label={t('form.tabsLabel')}
            className="flex gap-1 mb-4 border-b border-slate-200 dark:border-slate-600"
          >
            <button
              type="button"
              role="tab"
              id="proveedor-tab-datos"
              {...(activeTab === 'datos'
                ? { 'aria-selected': 'true' as const }
                : { 'aria-selected': 'false' as const })}
              aria-controls="proveedor-tabpanel-datos"
              data-testid="proveedor-tab-datos"
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'datos'
                  ? 'border-blue-600 text-blue-700 dark:text-blue-300'
                  : 'border-transparent text-slate-600 dark:text-slate-400'
              }`}
              onClick={() => setActiveTab('datos')}
            >
              {t('form.tabDatos')}
            </button>
            <button
              type="button"
              role="tab"
              id="proveedor-tab-catalogo"
              {...(activeTab === 'catalogo'
                ? { 'aria-selected': 'true' as const }
                : { 'aria-selected': 'false' as const })}
              aria-controls="proveedor-tabpanel-catalogo"
              data-testid="proveedor-tab-catalogo"
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'catalogo'
                  ? 'border-blue-600 text-blue-700 dark:text-blue-300'
                  : 'border-transparent text-slate-600 dark:text-slate-400'
              }`}
              onClick={() => setActiveTab('catalogo')}
            >
              {t('form.tabCatalogo')}
            </button>
            <button
              type="button"
              role="tab"
              id="proveedor-tab-cc"
              {...(activeTab === 'cc'
                ? { 'aria-selected': 'true' as const }
                : { 'aria-selected': 'false' as const })}
              aria-controls="proveedor-tabpanel-cc"
              data-testid="proveedor-tab-cc"
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'cc'
                  ? 'border-blue-600 text-blue-700 dark:text-blue-300'
                  : 'border-transparent text-slate-600 dark:text-slate-400'
              }`}
              onClick={() => setActiveTab('cc')}
            >
              {t('form.tabCuentaCorriente')}
            </button>
            <button
              type="button"
              role="tab"
              id="proveedor-tab-historial"
              {...(activeTab === 'historial'
                ? { 'aria-selected': 'true' as const }
                : { 'aria-selected': 'false' as const })}
              aria-controls="proveedor-tabpanel-historial"
              data-testid="proveedor-tab-historial"
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'historial'
                  ? 'border-blue-600 text-blue-700 dark:text-blue-300'
                  : 'border-transparent text-slate-600 dark:text-slate-400'
              }`}
              onClick={() => setActiveTab('historial')}
            >
              {t('form.tabHistorial')}
            </button>
          </div>
        ) : null}
        {loading ? (
          <p className="text-sm text-slate-500" data-testid="proveedor-form-loading">
            {tc('status.loading')}
          </p>
        ) : (
          <>
            {formError ? (
              <p role="alert" className="text-sm text-red-600 mb-2" data-testid="proveedor-form-error">
                {formError}
              </p>
            ) : null}
            {proveedorId != null && activeTab === 'catalogo' ? (
              <div
                role="tabpanel"
                id="proveedor-tabpanel-catalogo"
                aria-labelledby="proveedor-tab-catalogo"
                data-testid="proveedor-tabpanel-catalogo"
              >
                <ProveedorCatalogoSection proveedorId={proveedorId} />
              </div>
            ) : null}
            {proveedorId != null && activeTab === 'cc' ? (
              <div
                role="tabpanel"
                id="proveedor-tabpanel-cc"
                aria-labelledby="proveedor-tab-cc"
                data-testid="proveedor-tabpanel-cc"
              >
                <ProveedorCuentaCorrienteSection proveedorId={proveedorId} />
              </div>
            ) : null}
            {proveedorId != null && activeTab === 'historial' ? (
              <div
                role="tabpanel"
                id="proveedor-tabpanel-historial"
                aria-labelledby="proveedor-tab-historial"
                data-testid="proveedor-tabpanel-historial"
              >
                <ProveedorHistorialSection proveedorId={proveedorId} />
              </div>
            ) : null}
            <ProveedorDatosFormShell
              wrapAsTabPanel={proveedorId != null}
              activeTab={activeTab}
              onSubmit={(e) => {
                e.preventDefault()
                void submitForm()
              }}
            >
              <fieldset className="border border-slate-200 dark:border-slate-600 rounded p-3">
                <legend className="px-1 text-sm font-semibold">{t('form.sections.general')}</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div>
                    <label htmlFor="proveedor-form-codigo" className="block text-sm font-medium mb-1">
                      {t('form.codigo')}
                    </label>
                    <input
                      id="proveedor-form-codigo"
                      data-testid="proveedor-form-codigo"
                      type="number"
                      disabled={proveedorId != null}
                      value={formCodigo}
                      onChange={(e) => setFormCodigo(e.target.value)}
                      className={inputClass}
                      {...(fieldErrors.codigo ? { 'aria-invalid': 'true' as const } : {})}
                    />
                    {fieldErrors.codigo ? (
                      <p className="text-xs text-red-600 mt-1" role="alert">
                        {fieldErrors.codigo}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label htmlFor="proveedor-form-categoria" className="block text-sm font-medium mb-1">
                      {t('form.categoria')}
                    </label>
                    <select
                      id="proveedor-form-categoria"
                      data-testid="proveedor-form-categoria"
                      value={formCategoria}
                      onChange={(e) => setFormCategoria(e.target.value as ProveedorCategoria | '')}
                      className={inputClass}
                    >
                      <option value="">{t('form.categoriaNone')}</option>
                      {CATEGORIAS.map((c) => (
                        <option key={c} value={c}>
                          {t(`form.categoriaOptions.${c}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="proveedor-form-rsocial" className="block text-sm font-medium mb-1">
                      {t('form.rsocial')}
                    </label>
                    <input
                      id="proveedor-form-rsocial"
                      data-testid="proveedor-form-rsocial"
                      type="text"
                      value={formRsocial}
                      onChange={(e) => setFormRsocial(e.target.value)}
                      className={inputClass}
                      {...(fieldErrors.rsocial ? { 'aria-invalid': 'true' as const } : {})}
                    />
                    {fieldErrors.rsocial ? (
                      <p className="text-xs text-red-600 mt-1" role="alert">
                        {fieldErrors.rsocial}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label htmlFor="proveedor-form-fantasia" className="block text-sm font-medium mb-1">
                      {t('form.fantasia')}
                    </label>
                    <input
                      id="proveedor-form-fantasia"
                      data-testid="proveedor-form-fantasia"
                      type="text"
                      value={formFantasia}
                      onChange={(e) => setFormFantasia(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="proveedor-form-cuit" className="block text-sm font-medium mb-1">
                      {t(`form.taxId.${jurisdiccionFiscal}.label`)}
                    </label>
                    <input
                      id="proveedor-form-cuit"
                      data-testid="proveedor-form-cuit"
                      data-tax-id-kind={taxIdKind}
                      type="text"
                      value={formCuit}
                      onChange={(e) => setFormCuit(e.target.value)}
                      onBlur={() => {
                        const v = formCuit.trim()
                        if (v && validateTaxId(v, jurisdiccionFiscal)) {
                          setFormCuit(formatTaxId(v, jurisdiccionFiscal))
                        }
                      }}
                      className={inputClass}
                      {...(fieldErrors.cuit ? { 'aria-invalid': 'true' as const } : {})}
                    />
                    {fieldErrors.cuit ? (
                      <p className="text-xs text-red-600 mt-1" role="alert">
                        {fieldErrors.cuit}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label htmlFor="proveedor-form-cond" className="block text-sm font-medium mb-1">
                      {t('form.condIva')}
                    </label>
                    <select
                      id="proveedor-form-cond"
                      data-testid="proveedor-form-cond-iva"
                      value={formCondIva}
                      onChange={(e) => setFormCondIva(e.target.value as (typeof COND_IVA)[number])}
                      className={inputClass}
                    >
                      {COND_IVA.map((c) => (
                        <option key={c} value={c}>
                          {t(`form.condIvaOptions.${c}` as 'form.condIvaOptions.RI')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="proveedor-form-telef" className="block text-sm font-medium mb-1">
                      {t('form.telef')}
                    </label>
                    <input
                      id="proveedor-form-telef"
                      data-testid="proveedor-form-telef"
                      type="text"
                      value={formTelef}
                      onChange={(e) => setFormTelef(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="proveedor-form-email" className="block text-sm font-medium mb-1">
                      {t('form.email')}
                    </label>
                    <input
                      id="proveedor-form-email"
                      data-testid="proveedor-form-email"
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        data-testid="proveedor-form-activo"
                        checked={formActivo}
                        onChange={(e) => setFormActivo(e.target.checked)}
                      />
                      {t('form.activo')}
                    </label>
                  </div>
                </div>
              </fieldset>

              <details className="border border-slate-200 dark:border-slate-600 rounded p-3" open>
                <summary className="cursor-pointer text-sm font-semibold px-1">
                  {t('form.sections.banking')}
                </summary>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div className="sm:col-span-2">
                    <label htmlFor="proveedor-form-cbu" className="block text-sm font-medium mb-1">
                      {t('form.cbu')}
                    </label>
                    <input
                      id="proveedor-form-cbu"
                      data-testid="proveedor-form-cbu"
                      type="text"
                      inputMode="numeric"
                      value={formCbu}
                      onChange={(e) => setFormCbu(e.target.value)}
                      className={inputClass}
                      {...(fieldErrors.cbu ? { 'aria-invalid': 'true' as const } : {})}
                    />
                    {fieldErrors.cbu ? (
                      <p className="text-xs text-red-600 mt-1" role="alert">
                        {fieldErrors.cbu}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label htmlFor="proveedor-form-alias" className="block text-sm font-medium mb-1">
                      {t('form.alias')}
                    </label>
                    <input
                      id="proveedor-form-alias"
                      data-testid="proveedor-form-alias"
                      type="text"
                      value={formAlias}
                      onChange={(e) => setFormAlias(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="proveedor-form-banco" className="block text-sm font-medium mb-1">
                      {t('form.banco')}
                    </label>
                    <input
                      id="proveedor-form-banco"
                      data-testid="proveedor-form-banco"
                      type="text"
                      value={formBanco}
                      onChange={(e) => setFormBanco(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="proveedor-form-tipo-cuenta" className="block text-sm font-medium mb-1">
                      {t('form.tipoCuenta')}
                    </label>
                    <select
                      id="proveedor-form-tipo-cuenta"
                      data-testid="proveedor-form-tipo-cuenta"
                      value={formTipoCuenta}
                      onChange={(e) => setFormTipoCuenta(e.target.value as ProveedorTipoCuenta | '')}
                      className={inputClass}
                    >
                      <option value="">{t('form.tipoCuentaNone')}</option>
                      {TIPOS_CUENTA.map((tcv) => (
                        <option key={tcv} value={tcv}>
                          {t(`form.tipoCuentaOptions.${tcv}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="proveedor-form-moneda" className="block text-sm font-medium mb-1">
                      {t('form.moneda')}
                    </label>
                    <input
                      id="proveedor-form-moneda"
                      data-testid="proveedor-form-moneda"
                      type="text"
                      maxLength={3}
                      value={formMoneda}
                      onChange={(e) => setFormMoneda(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </details>

              <details className="border border-slate-200 dark:border-slate-600 rounded p-3">
                <summary className="cursor-pointer text-sm font-semibold px-1">
                  {t('form.sections.commercial')}
                </summary>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label htmlFor="proveedor-form-condicion-pago" className="block text-sm font-medium mb-1">
                      {t('form.condicionPago')}
                    </label>
                    <select
                      id="proveedor-form-condicion-pago"
                      data-testid="proveedor-form-condicion-pago"
                      value={formCondicionPago}
                      onChange={(e) => setFormCondicionPago(e.target.value as ProveedorCondicionPago | '')}
                      className={inputClass}
                    >
                      <option value="">{t('form.condicionPagoNone')}</option>
                      {CONDICIONES_PAGO.map((cp) => (
                        <option key={cp} value={cp}>
                          {t(`form.condicionPagoOptions.${cp}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="proveedor-form-plazo" className="block text-sm font-medium mb-1">
                      {t('form.plazoHabitual')}
                    </label>
                    <input
                      id="proveedor-form-plazo"
                      data-testid="proveedor-form-plazo"
                      type="number"
                      min={0}
                      value={formPlazoHabitual}
                      onChange={(e) => setFormPlazoHabitual(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="proveedor-form-descuento" className="block text-sm font-medium mb-1">
                      {t('form.descuentoPct')}
                    </label>
                    <input
                      id="proveedor-form-descuento"
                      data-testid="proveedor-form-descuento"
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      value={formDescuentoPct}
                      onChange={(e) => setFormDescuentoPct(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="proveedor-form-limite" className="block text-sm font-medium mb-1">
                      {t('form.limiteCredito')}
                    </label>
                    <input
                      id="proveedor-form-limite"
                      data-testid="proveedor-form-limite"
                      type="number"
                      min={0}
                      step="0.01"
                      value={formLimiteCredito}
                      onChange={(e) => setFormLimiteCredito(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </details>

              <details className="border border-slate-200 dark:border-slate-600 rounded p-3">
                <summary className="cursor-pointer text-sm font-semibold px-1">
                  {t('form.sections.contact')}
                </summary>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label htmlFor="proveedor-form-contacto-nombre" className="block text-sm font-medium mb-1">
                      {t('form.contactoNombre')}
                    </label>
                    <input
                      id="proveedor-form-contacto-nombre"
                      data-testid="proveedor-form-contacto-nombre"
                      type="text"
                      value={formContactoNombre}
                      onChange={(e) => setFormContactoNombre(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="proveedor-form-contacto-tel" className="block text-sm font-medium mb-1">
                      {t('form.contactoTel')}
                    </label>
                    <input
                      id="proveedor-form-contacto-tel"
                      data-testid="proveedor-form-contacto-tel"
                      type="text"
                      value={formContactoTel}
                      onChange={(e) => setFormContactoTel(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="proveedor-form-contacto-email" className="block text-sm font-medium mb-1">
                      {t('form.contactoEmail')}
                    </label>
                    <input
                      id="proveedor-form-contacto-email"
                      data-testid="proveedor-form-contacto-email"
                      type="email"
                      value={formContactoEmail}
                      onChange={(e) => setFormContactoEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="proveedor-form-notas" className="block text-sm font-medium mb-1">
                      {t('form.notas')}
                    </label>
                    <textarea
                      id="proveedor-form-notas"
                      data-testid="proveedor-form-notas"
                      rows={3}
                      value={formNotas}
                      onChange={(e) => setFormNotas(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </details>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600"
                  onClick={onClose}
                >
                  {tc('actions.cancel')}
                </button>
                <button
                  type="submit"
                  data-testid="btn-guardar-proveedor"
                  disabled={formSaving}
                  className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                >
                  {formSaving ? tc('actions.saving') : tc('actions.save')}
                </button>
              </div>
            </ProveedorDatosFormShell>
          </>
        )}
      </div>
    </div>
  )
}
