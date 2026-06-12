import type { ReactNode } from 'react'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'

type IfIntegrationProps = {
  id: string
  children: ReactNode
}

/**
 * @en Renders children only when the tenant has the given integration enabled (#174).
 * @es Renderiza hijos solo si el tenant tiene habilitada la integración (#174).
 * @pt-BR Renderiza filhos somente quando o tenant tem a integração habilitada (#174).
 */
export default function IfIntegration({ id, children }: IfIntegrationProps) {
  const { hasIntegration, status } = useFeatureFlags()

  if (status === 'loading' || status === 'idle') {
    return null
  }

  if (!hasIntegration(id)) {
    return null
  }

  return <>{children}</>
}
