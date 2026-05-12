import { Component, type ErrorInfo, type ReactNode } from 'react'
import { withTranslation, type WithTranslation } from 'react-i18next'

type ErrorBoundaryProps = WithTranslation & {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

/**
 * @en Catches render errors and shows a recoverable fallback message.
 * @es Captura errores de render y muestra un mensaje de respaldo recuperable.
 * @pt-BR Captura erros de renderização e exibe uma mensagem de fallback recuperável.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught render error', error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          data-testid="error-boundary-fallback"
          className="rounded border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          <p className="font-semibold">{this.props.t('errorBoundary.title')}</p>
          <p className="mt-1 text-sm">{this.props.t('errorBoundary.message')}</p>
        </div>
      )
    }

    return this.props.children
  }
}

export default withTranslation('common')(ErrorBoundary)
