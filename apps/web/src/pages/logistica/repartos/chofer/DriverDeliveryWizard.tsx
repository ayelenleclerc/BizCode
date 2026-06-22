import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  repartosAPI,
  type MotivoNoEntrega,
  type RepartoItemPodInput,
  type RepartoItemRow,
} from '@/lib/api'
import {
  compressPhotoFile,
  compressSignatureDataUrl,
  POD_MAX_FIRMA_BYTES,
  POD_MAX_FOTO_BYTES,
} from '@/lib/podMedia'
import PodSignatureCanvas from './PodSignatureCanvas'

const MOTIVOS: MotivoNoEntrega[] = [
  'ausente',
  'rechazo',
  'domicilio_incorrecto',
  'producto_dañado',
  'otro',
]

type Props = {
  repartoId: number
  item: RepartoItemRow
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export default function DriverDeliveryWizard({ repartoId, item, open, onClose, onSaved }: Props) {
  const { t } = useTranslation('pod')
  const [step, setStep] = useState(0)
  const [outcome, setOutcome] = useState<'delivered' | 'not_delivered'>('delivered')
  const [receptorNombre, setReceptorNombre] = useState('')
  const [receptorDni, setReceptorDni] = useState('')
  const [firmaDataUrl, setFirmaDataUrl] = useState<string | null>(null)
  const [fotoDataUrl, setFotoDataUrl] = useState<string | null>(null)
  const [notas, setNotas] = useState('')
  const [motivo, setMotivo] = useState<MotivoNoEntrega>('ausente')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const cliente = item.ordenEntrega.cliente?.rsocial ?? `#${item.ordenEntregaId}`

  const canConfirmDelivered =
    outcome === 'delivered' && receptorNombre.trim().length > 0 && firmaDataUrl != null && firmaDataUrl.length > 0

  const canConfirmNotDelivered = outcome === 'not_delivered' && motivo.length > 0

  const handlePhoto = async (file: File | null) => {
    if (!file) return
    setError(null)
    try {
      const dataUrl = await compressPhotoFile(file, POD_MAX_FOTO_BYTES)
      setFotoDataUrl(dataUrl)
    } catch {
      setError(t('errors.photoTooLarge'))
    }
  }

  const handleSubmit = async () => {
    setSaving(true)
    setError(null)
    try {
      let firmaBase64: string | null = null
      let fotoBase64: string | null = null
      if (outcome === 'delivered') {
        if (!firmaDataUrl) {
          setError(t('signatureRequired'))
          setSaving(false)
          return
        }
        try {
          firmaBase64 = compressSignatureDataUrl(firmaDataUrl, POD_MAX_FIRMA_BYTES)
        } catch {
          setError(t('errors.firmaTooLarge'))
          setSaving(false)
          return
        }
        fotoBase64 = fotoDataUrl
      }

      const body: RepartoItemPodInput = {
        outcome,
        receptorNombre: outcome === 'delivered' ? receptorNombre.trim() : null,
        receptorDni: outcome === 'delivered' ? receptorDni.trim() || null : null,
        firmaBase64,
        fotoBase64,
        notasEntrega: notas.trim() || null,
        motivoNoEntrega: outcome === 'not_delivered' ? motivo : null,
      }
      await repartosAPI.updateItemPod(repartoId, item.id, body)
      onSaved()
      onClose()
      setStep(0)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('POD_FIRMA')) {
        setError(t('signatureRequired'))
      } else {
        setError(t('errors.save'))
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pod-wizard-title"
      data-testid="pod-wizard-dialog"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-slate-900 p-4 shadow-xl">
        <h2 id="pod-wizard-title" className="text-lg font-bold mb-1">
          {t('wizardTitle')}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{cliente}</p>

        <p className="text-xs text-slate-500 mb-3" aria-live="polite">
          {t(
            step === 0
              ? 'stepReceptor'
              : step === 1
                ? 'stepSignature'
                : step === 2
                  ? 'stepPhoto'
                  : 'stepConfirm',
          )}
        </p>

        {step === 0 && outcome === 'delivered' && (
          <div className="space-y-3">
            <label className="block text-sm">
              <span>{t('receptorNombre')}</span>
              <input
                required
                value={receptorNombre}
                onChange={(e) => setReceptorNombre(e.target.value)}
                className="mt-1 w-full border rounded px-2 py-2 dark:bg-slate-800"
                data-testid="pod-receptor-nombre"
              />
            </label>
            <label className="block text-sm">
              <span>{t('receptorDni')}</span>
              <input
                value={receptorDni}
                onChange={(e) => setReceptorDni(e.target.value)}
                className="mt-1 w-full border rounded px-2 py-2 dark:bg-slate-800"
                data-testid="pod-receptor-dni"
              />
            </label>
          </div>
        )}

        {step === 1 && outcome === 'delivered' && <PodSignatureCanvas onChange={setFirmaDataUrl} />}

        {step === 2 && outcome === 'delivered' && (
          <label className="block text-sm">
            <span>{t('photoLabel')}</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => void handlePhoto(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm"
              data-testid="pod-photo-input"
            />
          </label>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <fieldset>
              <legend className="text-sm font-medium">{t('stepConfirm')}</legend>
              <label className="flex items-center gap-2 mt-2 text-sm">
                <input
                  type="radio"
                  name="outcome"
                  checked={outcome === 'delivered'}
                  onChange={() => setOutcome('delivered')}
                />
                {t('outcomeDelivered')}
              </label>
              <label className="flex items-center gap-2 mt-1 text-sm">
                <input
                  type="radio"
                  name="outcome"
                  checked={outcome === 'not_delivered'}
                  onChange={() => {
                    setOutcome('not_delivered')
                    setStep(3)
                  }}
                />
                {t('outcomeNotDelivered')}
              </label>
            </fieldset>
            {outcome === 'not_delivered' && (
              <label className="block text-sm">
                <span>{t('motivoLabel')}</span>
                <select
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value as MotivoNoEntrega)}
                  className="mt-1 w-full border rounded px-2 py-2 dark:bg-slate-800"
                  data-testid="pod-motivo"
                >
                  {MOTIVOS.map((m) => (
                    <option key={m} value={m}>
                      {t(`motivo.${m}`)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="block text-sm">
              <span>{t('notas')}</span>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={2}
                className="mt-1 w-full border rounded px-2 py-2 dark:bg-slate-800"
                data-testid="pod-notas"
              />
            </label>
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600 mt-3" data-testid="pod-wizard-error">
            {error}
          </p>
        )}

        <div className="flex justify-between gap-2 mt-6">
          <button type="button" onClick={onClose} className="px-3 py-2 border rounded text-sm">
            {t('cancel')}
          </button>
          <div className="flex gap-2">
            {step > 0 && outcome === 'delivered' && (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="px-3 py-2 border rounded text-sm">
                {t('back')}
              </button>
            )}
            {step < 3 && outcome === 'delivered' && (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={
                  (step === 0 && receptorNombre.trim().length === 0) ||
                  (step === 1 && (firmaDataUrl == null || firmaDataUrl.length === 0))
                }
                className="px-3 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
                data-testid="pod-wizard-next"
              >
                {t('next')}
              </button>
            )}
            {(step === 3 || outcome === 'not_delivered') && (
              <button
                type="button"
                disabled={
                  saving ||
                  (outcome === 'delivered' && !canConfirmDelivered) ||
                  (outcome === 'not_delivered' && !canConfirmNotDelivered)
                }
                onClick={() => void handleSubmit()}
                className="px-3 py-2 bg-green-700 text-white rounded text-sm disabled:opacity-50"
                data-testid="pod-wizard-confirm"
              >
                {t('confirm')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
