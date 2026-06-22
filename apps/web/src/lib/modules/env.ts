import type { DeploymentEnv } from './types'

/**
 * @en Resolves deployment environment from server env vars (never from tenant config).
 * @es Resuelve el ambiente de despliegue desde variables del servidor (nunca desde config del tenant).
 * @pt-BR Resolve o ambiente de implantação a partir de variáveis do servidor (nunca da config do tenant).
 */
export function resolveDeploymentEnv(
  env: NodeJS.ProcessEnv = process.env,
): DeploymentEnv {
  const appEnv = env.APP_ENV?.trim().toLowerCase()
  if (appEnv === 'production' || appEnv === 'prod') {
    return 'prod'
  }
  if (appEnv === 'development' || appEnv === 'dev') {
    return 'dev'
  }
  return env.NODE_ENV === 'production' ? 'prod' : 'dev'
}
