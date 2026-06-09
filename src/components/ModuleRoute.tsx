import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { ModuleKey } from '@/lib/modules'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'

export type ModuleDisabledLocationState = {
  moduleDisabled?: ModuleKey
}

type ModuleRouteProps = {
  moduleKey: ModuleKey
  children: ReactNode
}

/**
 * @en Route guard: redirects to home when the module is disabled for the tenant (#224).
 * @es Guard de ruta: redirige a inicio si el módulo no está habilitado (#224).
 * @pt-BR Guarda de rota: redireciona ao início se o módulo não estiver habilitado (#224).
 */
export default function ModuleRoute({ moduleKey, children }: ModuleRouteProps) {
  const { hasModule, status } = useFeatureFlags()

  if (status === 'loading' || status === 'idle') {
    return null
  }

  if (!hasModule(moduleKey)) {
    return <Navigate to="/inicio" replace state={{ moduleDisabled: moduleKey }} />
  }

  return <>{children}</>
}
