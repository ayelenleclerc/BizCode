# Estrategia de internacionalización (i18n)

## Biblioteca

**react-i18next** + **i18next** — véase [ADR-0002](adr/ADR-0002-i18n-library.md).

## Locales admitidos

| Código BCP 47 | Idioma | Estado |
|---|---|---|
| `es` | Español (Argentina) | Predeterminado, fuente de verdad |
| `en` | Inglés | Admitido |
| `pt-BR` | Portugués brasileño | Admitido |

## Estructura de namespaces

Un namespace por módulo funcional principal:

| Namespace | Patrón de archivo | Uso |
|---|---|---|
| `common` | `src/locales/<lang>/common.json` | Layout, componentes compartidos, acciones, mensajes de estado |
| `clientes` | `src/locales/<lang>/clientes.json` | Pantallas y formularios de clientes |
| `articulos` | `src/locales/<lang>/articulos.json` | Pantallas y formularios de artículos |
| `facturacion` | `src/locales/<lang>/facturacion.json` | Pantallas y formularios de facturación |

## Convención de claves

- Notación con puntos y segmentos camelCase: `form.titleEdit`, `errors.noCliente`, `table.rsocial`.
- Interpolación con `{{variable}}`: `"titleEdit": "Editar Cliente #{{codigo}}"`.
- Claves agrupadas por sección: `form.*`, `table.*`, `errors.*`, `list.*`, `detail.*`.

## Añadir un nuevo locale

1. Duplicar el directorio `src/locales/es/` a `src/locales/<lang>/`.
2. Traducir todos los valores (sin cambiar las claves).
3. Añadir el locale en `src/i18n/config.ts` (imports y mapa `resources`).
4. Ejecutar `npm run check:i18n`.

## Añadir una nueva clave

1. Añadir la clave en `src/locales/es/<namespace>.json` (español, fuente de verdad).
2. Añadir la misma clave en `en` y `pt-BR` con valor traducido.
3. Usar `t('clave')` o `useTranslation('namespace')` + `t('clave')` en el componente.
4. Ejecutar `npm run check:i18n`.

## Notas técnicas

- Los JSON se **importan estáticamente** en `src/i18n/config.ts` (sin backend HTTP). El WebView de Tauri no puede hacer `fetch()` al sistema de archivos.
- El idioma del usuario se guarda en `localStorage` con la clave `lang`.
- Cambio de idioma en tiempo de ejecución: `i18n.changeLanguage(lang)`.

## Paridad en CI

`scripts/check-i18n.ts` aplana las claves de `es` (fuente) y las compara con `en` y `pt-BR`. Sale con código 1 si falta o sobra alguna clave.

## Idiomas de la documentación (Markdown)

La documentación de producto y calidad en `docs/` se mantiene en **tres árboles paralelos**: `docs/en/`, `docs/es/`, `docs/pt-br/`, con **nombres de archivo localizados** por idioma. Véase [I18N_DOCUMENTATION.md](../I18N_DOCUMENTATION.md) y [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md). El contrato OpenAPI permanece en un único archivo: `docs/api/openapi.yaml`.
