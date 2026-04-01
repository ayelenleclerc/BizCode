# Estratégia de internacionalização (i18n)

## Biblioteca

**react-i18next** + **i18next** — ver [ADR-0002](adr/ADR-0002-i18n-library.md).

## Locales suportados

| Código BCP 47 | Idioma | Estado |
|---|---|---|
| `es` | Espanhol (Argentina) | Padrão, fonte de verdade |
| `en` | Inglês | Suportado |
| `pt-BR` | Português brasileiro | Suportado |

## Estrutura de namespaces

Um namespace por módulo principal:

| Namespace | Arquivo | Uso |
|---|---|---|
| `common` | `src/locales/<lang>/common.json` | Layout, componentes compartilhados |
| `clientes` | `src/locales/<lang>/clientes.json` | Clientes |
| `articulos` | `src/locales/<lang>/articulos.json` | Produtos |
| `facturacion` | `src/locales/<lang>/facturacion.json` | Faturamento |

## Convenção de chaves

- Notação com pontos e camelCase: `form.titleEdit`, `errors.noCliente`.
- Interpolação: `{{variable}}`.
- Agrupamento: `form.*`, `table.*`, `errors.*`, etc.

## Adicionar locale

1. Duplicar `src/locales/es/` para `src/locales/<lang>/`.
2. Traduzir valores (não alterar chaves).
3. Registrar em `src/i18n/config.ts`.
4. `npm run check:i18n`.

## Adicionar chave

1. Incluir em `es/<namespace>.json`.
2. Replicar chave em `en` e `pt-BR`.
3. Usar `t('chave')` no componente.
4. `npm run check:i18n`.

## Notas técnicas

- Imports estáticos em `src/i18n/config.ts` (sem HTTP).
- Preferência de idioma em `localStorage` (`lang`).
- `i18n.changeLanguage(lang)`.

## Paridade no CI

`scripts/check-i18n.ts` compara `es` com `en` e `pt-BR`.

## Idiomas da documentação (Markdown)

Documentação em `docs/en/`, `docs/es/`, `docs/pt-br/` com **nomes de arquivo localizados** por idioma. Ver [I18N_DOCUMENTATION.md](../I18N_DOCUMENTATION.md) e [DOCUMENT_LOCALE_MAP.md](../DOCUMENT_LOCALE_MAP.md). OpenAPI único: `docs/api/openapi.yaml`.

**Outros idiomas:** [English](../en/estrategia-i18n.md) · [Español](../es/estrategia-i18n.md)
