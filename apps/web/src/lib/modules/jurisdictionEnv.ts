import {
  DEFAULT_FISCAL_JURISDICTION,
  FISCAL_JURISDICTION_CODES,
  isFiscalJurisdictionCode,
  type FiscalJurisdictionCode,
} from '@bizcode/types'

/**
 * @en Fiscal jurisdictions offered by this installation (#437), resolved from server env vars only.
 * @es Jurisdicciones fiscales que ofrece esta instalación (#437), resueltas solo desde el entorno del servidor.
 * @pt-BR Jurisdições fiscais oferecidas por esta instalação (#437), resolvidas apenas do ambiente do servidor.
 */
export type InstallationJurisdictions = {
  enabled: readonly FiscalJurisdictionCode[]
  default: FiscalJurisdictionCode
}

function parseEnabled(raw: string | undefined): readonly FiscalJurisdictionCode[] {
  const codes = (raw ?? '')
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .filter(isFiscalJurisdictionCode)
  const unique = [...new Set(codes)]
  return unique.length > 0 ? unique : FISCAL_JURISDICTION_CODES
}

/**
 * @en Reads `BIZCODE_FISCAL_JURISDICTIONS` and `BIZCODE_DEFAULT_JURISDICTION`. Unset or invalid values
 *   fall back to the pre-#437 behaviour: every catalog jurisdiction enabled and `AR` as default.
 *   When `AR` is not enabled the default becomes the first enabled jurisdiction, and an explicit
 *   default is always forced into the enabled list, so a tenant can never be created with a
 *   jurisdiction the installation rejects. Mirrors `resolveDeploymentEnv`: server env only, never
 *   tenant configuration.
 * @es Lee `BIZCODE_FISCAL_JURISDICTIONS` y `BIZCODE_DEFAULT_JURISDICTION`. Sin definir o con valores
 *   inválidos se conserva el comportamiento previo a #437: todas las jurisdicciones del catálogo
 *   habilitadas y `AR` por defecto. El default siempre se fuerza dentro de las habilitadas para que
 *   ningún tenant nazca con una jurisdicción que la instalación rechaza. Sigue a
 *   `resolveDeploymentEnv`: solo entorno del servidor, nunca configuración del tenant.
 * @pt-BR Lê `BIZCODE_FISCAL_JURISDICTIONS` e `BIZCODE_DEFAULT_JURISDICTION`. Sem definição ou com
 *   valores inválidos mantém o comportamento anterior a #437: todas as jurisdições do catálogo
 *   habilitadas e `AR` como padrão. O padrão é sempre forçado para dentro das habilitadas, de modo
 *   que nenhum tenant nasça com uma jurisdição que a instalação rejeita. Espelha
 *   `resolveDeploymentEnv`: apenas ambiente do servidor, nunca configuração do tenant.
 */
export function resolveInstallationJurisdictions(
  env: NodeJS.ProcessEnv = process.env,
): InstallationJurisdictions {
  const enabled = parseEnabled(env.BIZCODE_FISCAL_JURISDICTIONS)
  const requested = env.BIZCODE_DEFAULT_JURISDICTION?.trim().toUpperCase()

  if (isFiscalJurisdictionCode(requested)) {
    return {
      enabled: enabled.includes(requested) ? enabled : [...enabled, requested],
      default: requested,
    }
  }

  return {
    enabled,
    default: enabled.includes(DEFAULT_FISCAL_JURISDICTION)
      ? DEFAULT_FISCAL_JURISDICTION
      : enabled[0],
  }
}

/**
 * @en Jurisdiction assigned to tenants created without an explicit choice.
 * @es Jurisdicción asignada a los tenants creados sin elección explícita.
 * @pt-BR Jurisdição atribuída aos tenants criados sem escolha explícita.
 */
export function resolveDefaultJurisdiction(
  env: NodeJS.ProcessEnv = process.env,
): FiscalJurisdictionCode {
  return resolveInstallationJurisdictions(env).default
}

/**
 * @en Whether the installation allows tenants taxed in the given jurisdiction.
 * @es Si la instalación admite tenants que tributan en la jurisdicción dada.
 * @pt-BR Se a instalação admite tenants que tributam na jurisdição informada.
 */
export function isJurisdictionEnabled(
  jurisdiction: unknown,
  env: NodeJS.ProcessEnv = process.env,
): jurisdiction is FiscalJurisdictionCode {
  return (
    isFiscalJurisdictionCode(jurisdiction) &&
    resolveInstallationJurisdictions(env).enabled.includes(jurisdiction)
  )
}
