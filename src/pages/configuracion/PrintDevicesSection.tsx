import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { printingAPI } from '@/lib/api'

type PrintingStatus = {
  fiscalPrinterEnabled: boolean
  thermalPrinterEnabled: boolean
  fiscalMode: 'mock'
  thermalMode: 'mock'
}

export default function PrintDevicesSection() {
  const { t } = useTranslation(['empresa', 'common'])
  const [status, setStatus] = useState<PrintingStatus | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [testingDevice, setTestingDevice] = useState<'fiscal' | 'thermal' | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [testError, setTestError] = useState<string | null>(null)

  useEffect(() => {
    printingAPI
      .status()
      .then((data) => {
        setStatus(data)
        setLoadError(false)
      })
      .catch(() => setLoadError(true))
  }, [])

  const handleTest = async (device: 'fiscal' | 'thermal') => {
    setTestingDevice(device)
    setFeedback(null)
    setTestError(null)
    try {
      const result = await printingAPI.test(device)
      if (result.fallbackToPdf) {
        setFeedback(
          device === 'thermal'
            ? t('printDevices.feedback.thermalFallback')
            : t('printDevices.feedback.fiscalFallback'),
        )
        return
      }
      if (result.jobId) {
        setFeedback(
          device === 'thermal'
            ? t('printDevices.feedback.thermalSuccess', { jobId: result.jobId })
            : t('printDevices.feedback.fiscalSuccess', { jobId: result.jobId }),
        )
      }
    } catch (err: unknown) {
      setTestError((err as Error).message || t('printDevices.feedback.error'))
    } finally {
      setTestingDevice(null)
    }
  }

  const anyDeviceEnabled =
    status?.fiscalPrinterEnabled === true || status?.thermalPrinterEnabled === true

  return (
    <section
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 mt-6"
      aria-labelledby="print-devices-heading"
      data-testid="print-devices-section"
    >
      <h2
        id="print-devices-heading"
        className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1"
      >
        {t('printDevices.title')}
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t('printDevices.subtitle')}</p>

      {loadError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {t('printDevices.loadError')}
        </p>
      ) : status === null ? (
        <p className="text-sm text-slate-400">{t('common:status.loading')}</p>
      ) : (
        <>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
            {status.fiscalPrinterEnabled
              ? t('printDevices.fiscalEnabled')
              : t('printDevices.fiscalDisabled')}
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
            {status.thermalPrinterEnabled
              ? t('printDevices.thermalEnabled')
              : t('printDevices.thermalDisabled')}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            {t('printDevices.modeMock')} — {status.thermalMode} / {status.fiscalMode}
          </p>
          {!anyDeviceEnabled ? (
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2" data-testid="print-devices-opt-in-hint">
              {t('printDevices.optInHint')}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {status.thermalPrinterEnabled ? (
                <button
                  type="button"
                  data-testid="btn-print-test-thermal"
                  disabled={testingDevice !== null}
                  onClick={() => void handleTest('thermal')}
                  className="px-3 py-2 text-sm bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded transition disabled:opacity-50"
                >
                  {testingDevice === 'thermal' ? t('printDevices.testing') : t('printDevices.testThermal')}
                </button>
              ) : null}
              {status.fiscalPrinterEnabled ? (
                <button
                  type="button"
                  data-testid="btn-print-test-fiscal"
                  disabled={testingDevice !== null}
                  onClick={() => void handleTest('fiscal')}
                  className="px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded transition disabled:opacity-50"
                >
                  {testingDevice === 'fiscal' ? t('printDevices.testing') : t('printDevices.testFiscal')}
                </button>
              ) : null}
            </div>
          )}
        </>
      )}

      {(feedback || testError) && (
        <p
          data-testid="print-devices-feedback"
          className={`mt-3 text-sm ${testError ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-300'}`}
          role="alert"
          aria-live="polite"
        >
          {testError ?? feedback}
        </p>
      )}
    </section>
  )
}
