import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { notifChannelsAPI } from '@/lib/api'

type ChannelStatus = { inApp: boolean; email: boolean; whatsapp: boolean }

function ChannelRow({ label, active }: { label: string; active: boolean }) {
  const { t } = useTranslation('common')
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          active
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
        }`}
      >
        {active ? t('notifChannels.active') : t('notifChannels.inactive')}
      </span>
    </div>
  )
}

export default function NotifChannelsPanel() {
  const { t } = useTranslation('common')
  const [status, setStatus] = useState<ChannelStatus | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    notifChannelsAPI
      .status()
      .then((data) => setStatus(data))
      .catch(() => setError(true))
  }, [])

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
      <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
        {t('notifChannels.title')}
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t('notifChannels.subtitle')}</p>

      {error ? (
        <p className="text-sm text-red-500">{t('notifChannels.loadError')}</p>
      ) : status === null ? (
        <p className="text-sm text-slate-400">{t('status.loading')}</p>
      ) : (
        <div>
          <ChannelRow label={t('notifChannels.inApp')} active={status.inApp} />
          <ChannelRow label={t('notifChannels.email')} active={status.email} />
          <ChannelRow label={t('notifChannels.whatsapp')} active={status.whatsapp} />
        </div>
      )}
    </div>
  )
}
