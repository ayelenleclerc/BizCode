# Internationalization Strategy

## Library

**react-i18next** + **i18next** — see [ADR-0002](adr/ADR-0002-i18n-library.md) for rationale.

## Supported Locales

| BCP 47 code | Language | Status |
|---|---|---|
| `es` | Spanish (Argentina) | Default, source of truth |
| `en` | English | Supported |
| `pt-BR` | Brazilian Portuguese | Supported |

## Namespace Structure

One namespace per major feature module:

| Namespace | File pattern | Used in |
|---|---|---|
| `common` | `src/locales/<lang>/common.json` | Layout, shared components, actions, status messages |
| `clientes` | `src/locales/<lang>/clientes.json` | Customer pages and forms |
| `articulos` | `src/locales/<lang>/articulos.json` | Product pages and forms |
| `facturacion` | `src/locales/<lang>/facturacion.json` | Invoice pages and forms |

## Key Naming Convention

- Dot notation with camelCase segments: `form.titleEdit`, `errors.noCliente`, `table.rsocial`.
- Interpolation uses `{{variable}}`: `"titleEdit": "Editar Cliente #{{codigo}}"`.
- Keys are grouped by UI section: `form.*`, `table.*`, `errors.*`, `list.*`, `detail.*`.

## Adding a New Locale

1. Duplicate the `src/locales/es/` directory to `src/locales/<lang>/`.
2. Translate all values (do not change the keys).
3. Add the new locale to `src/i18n/config.ts`:
   - Import all 4 JSON files.
   - Add to the `resources` map.
4. Run `npm run check:i18n` — it will report any missing or extra keys.

## Adding a New Key

1. Add the key to `src/locales/es/<namespace>.json` (Spanish, source of truth).
2. Add the same key (with translated value) to `en` and `pt-BR`.
3. Use `t('namespace:key')` or `useTranslation('namespace')` + `t('key')` in the component.
4. Run `npm run check:i18n` to verify parity.

## Technical Notes

- Locale files are **statically imported** in `src/i18n/config.ts` (no HTTP backend). This is required because Tauri's WebView cannot perform `fetch()` to the filesystem.
- The user's language preference is persisted in `localStorage` under the key `lang`.
- Language switching at runtime is supported via `i18n.changeLanguage(lang)`.

## Parity Enforcement

`scripts/check-i18n.ts` flattens all keys from `es` (source) and compares them against `en` and `pt-BR`. It exits with code 1 if any namespace has missing or extra keys, blocking CI.

## Documentation languages (Markdown)

Product and quality documentation under `docs/` is maintained in **three parallel trees**: `docs/en/`, `docs/es/`, `docs/pt-br/`, with **localized filenames** per tree (see [I18N_DOCUMENTATION.md](../I18N_DOCUMENTATION.md) and [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md)). The OpenAPI contract remains a single file at `docs/api/openapi.yaml`.
