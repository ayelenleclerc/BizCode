import type { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { Permission } from '@/lib/rbac'

type Props = {
  permission: Permission
  /** Rendered when the user has the required permission. */
  children: ReactNode
  /** Optionally render something else when access is denied (default: nothing). */
  fallback?: ReactNode
}

/**
 * @en Renders children only when the authenticated user holds the required permission.
 * @es Renderiza hijos solo si el usuario autenticado posee el permiso requerido.
 * @pt-BR Renderiza filhos somente se o usuário autenticado possui a permissão requerida.
 */
export function CanAccess({ permission, children, fallback = null }: Props) {
  const { claims } = useAuth()
  if (!claims || !claims.permissions.includes(permission)) {
    return <>{fallback}</>
  }
  return <>{children}</>
}
