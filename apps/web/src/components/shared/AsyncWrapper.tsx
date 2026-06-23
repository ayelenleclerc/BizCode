import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import LoadingSpinner from '@/components/LoadingSpinner'

type AsyncWrapperProps = {
  loading: boolean
  error: unknown
  children: ReactNode
  loadingMessage?: string
}

/**
 * @en Shows a spinner while loading, an error message on failure, otherwise children.
 * @es Muestra un spinner al cargar, un error si falla, o los hijos en éxito.
 * @pt-BR Exibe um spinner ao carregar, erro em falha, ou os filhos em sucesso.
 */
export default function AsyncWrapper({
  loading,
  error,
  children,
  loadingMessage,
}: AsyncWrapperProps) {
  const { t } = useTranslation('common')

  if (loading) {
    return <LoadingSpinner message={loadingMessage} />
  }

  if (error) {
    return (
      <div
        role="alert"
        data-testid="async-wrapper-error"
        className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      >
        {t('async.loadFailed')}
      </div>
    )
  }

  return <>{children}</>
}
