import { MODULE_CATALOG, MODULE_KEYS, type ModuleKey } from './catalog'
import type { DeploymentEnv, ModuleDef, ModuleValidationResult } from './types'

function isModuleKey(value: string): value is ModuleKey {
  return value in MODULE_CATALOG
}

/**
 * @en Whether a module may be turned off for the given deployment environment.
 * @es Si un módulo puede desactivarse en el ambiente de despliegue dado.
 * @pt-BR Se um módulo pode ser desativado no ambiente de implantação informado.
 */
export function canDeactivate(key: ModuleKey, env: DeploymentEnv): boolean {
  const mod = MODULE_CATALOG[key]
  if (mod.required) {
    return false
  }
  if (mod.requiredInProd && env === 'prod') {
    return false
  }
  return true
}

function moduleIsRequired(def: ModuleDef, env: DeploymentEnv): boolean {
  return def.required || (def.requiredInProd && env === 'prod')
}

/**
 * @en Validates an active module set against required flags and dependency edges.
 * @es Valida un conjunto de módulos activos frente a obligatorios y dependencias.
 * @pt-BR Valida um conjunto de módulos ativos contra obrigatórios e dependências.
 */
export function validateModuleSet(modules: readonly ModuleKey[], env: DeploymentEnv): ModuleValidationResult {
  const active = new Set<ModuleKey>(modules)
  const errors: ModuleValidationResult['errors'] = []

  for (const key of MODULE_KEYS) {
    const def = MODULE_CATALOG[key]
    const isActive = active.has(key)
    const isRequired = moduleIsRequired(def, env)

    if (isRequired && !isActive) {
      errors.push({ module: key, reason: 'required_module_missing' })
    }

    if (isActive) {
      for (const dep of def.dependencies) {
        if (!isModuleKey(dep)) {
          errors.push({ module: key, reason: `missing_dependency:${dep}` })
          continue
        }
        if (!active.has(dep)) {
          errors.push({ module: key, reason: `missing_dependency:${dep}` })
        }
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * @en Returns dependency cycles in the catalog graph (empty when acyclic).
 * @es Devuelve ciclos en el grafo de dependencias del catálogo (vacío si es acíclico).
 * @pt-BR Retorna ciclos no grafo de dependências do catálogo (vazio se acíclico).
 */
export function detectCatalogDependencyCycles(): ModuleKey[][] {
  const visiting = new Set<ModuleKey>()
  const visited = new Set<ModuleKey>()
  const cycles: ModuleKey[][] = []

  function dfs(node: ModuleKey, stack: ModuleKey[]): void {
    if (visited.has(node)) {
      return
    }
    if (visiting.has(node)) {
      const cycleStart = stack.indexOf(node)
      if (cycleStart >= 0) {
        cycles.push([...stack.slice(cycleStart), node])
      }
      return
    }

    visiting.add(node)
    stack.push(node)

    for (const dep of MODULE_CATALOG[node].dependencies) {
      if (isModuleKey(dep)) {
        dfs(dep, stack)
      }
    }

    stack.pop()
    visiting.delete(node)
    visited.add(node)
  }

  for (const key of MODULE_KEYS) {
    dfs(key, [])
  }

  return cycles
}

/**
 * @en Ensures every dependency string in the catalog references another catalog key.
 * @es Comprueba que cada dependencia del catálogo apunte a otra clave existente.
 * @pt-BR Garante que cada dependência do catálogo referencia outra chave existente.
 */
export function findUnknownCatalogDependencies(): { module: ModuleKey; dependency: string }[] {
  const unknown: { module: ModuleKey; dependency: string }[] = []
  for (const key of MODULE_KEYS) {
    for (const dep of MODULE_CATALOG[key].dependencies) {
      if (!isModuleKey(dep)) {
        unknown.push({ module: key, dependency: dep })
      }
    }
  }
  return unknown
}
