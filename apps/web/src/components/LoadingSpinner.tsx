import { useTranslation } from 'react-i18next'
import { Spinner } from '@bizcode/ui/web'

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
      className="flex flex-col items-center justify-center py-12 text-slate-600 dark:text-slate-300"
      data-testid="loading-spinner"
    >
      <Spinner label={label} testID="loading-spinner-indicator" />
    </div>
  )
}
