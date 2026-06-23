import type { ModuleKey } from './catalog'

/**
 * @en Maps a module key to a stable i18n suffix (dots → underscores).
 * @es Mapea una clave de módulo a un sufijo i18n estable (puntos → guiones bajos).
 * @pt-BR Mapeia uma chave de módulo para um sufixo i18n estável (pontos → sublinhados).
 */
export function moduleI18nSuffix(key: ModuleKey): string {
  return key.replace(/\./g, '_')
}

/**
 * @en Full `common` namespace key for a module display name.
 * @es Clave completa del namespace `common` para el nombre visible del módulo.
 * @pt-BR Chave completa do namespace `common` para o nome exibido do módulo.
 */
export function moduleI18nKey(key: ModuleKey): `modules.${string}` {
  return `modules.${moduleI18nSuffix(key)}`
}
