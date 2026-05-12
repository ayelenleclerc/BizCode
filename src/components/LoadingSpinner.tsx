import { useTranslation } from 'react-i18next'

type LoadingSpinnerProps = {
  message?: string
}

/**
 * @en Centered loading indicator with optional message and dark-mode styles.
 * @es Indicador de carga centrado con mensaje opcional y estilos en modo oscuro.
 * @pt-BR Indicador de carregamento centralizado com mensagem opcional e suporte ao modo escuro.
 */
export default function LoadingSpinner({ message }: LoadingSpinnerProps) {
  const { t } = useTranslation('common')
  const label = message ?? t('status.loading')

  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-12 text-slate-600 dark:text-slate-300"
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid="loading-spinner"
    >
      <span
        className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-600 dark:border-t-blue-400"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  )
}
