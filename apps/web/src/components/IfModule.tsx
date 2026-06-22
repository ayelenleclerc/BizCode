import type { ReactNode } from 'react'
import type { ModuleKey } from '@/lib/modules'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'

type IfModuleProps = {
  flag: ModuleKey
  children: ReactNode
}

/**
 * @en Renders children only when the tenant has the given module enabled (#224).
 * @es Renderiza hijos solo si el tenant tiene habilitado el módulo (#224).
 * @pt-BR Renderiza filhos somente quando o tenant tem o módulo habilitado (#224).
 */
export default function IfModule({ flag, children }: IfModuleProps) {
  const { hasModule, status } = useFeatureFlags()

  if (status === 'loading' || status === 'idle') {
    return null
  }

  if (!hasModule(flag)) {
    return null
  }

  return <>{children}</>
}
