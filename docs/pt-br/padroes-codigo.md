# Padrões de código

## TypeScript

- Modo strict obrigatório (`tsconfig.json`: `"strict": true`).
- `any` é proibido como erro; use `unknown` e estreite tipos, ou `// eslint-disable-next-line @typescript-eslint/no-explicit-any` com comentário.
- Prefira `interface` para formas expostas como contrato de API; use `type` para uniões e utilitários.
- Parâmetros e retornos devem ser tipados explicitamente.

## React

- Apenas componentes funcionais.
- Prefira inicializadores preguiçosos de `useState` em vez de `useEffect` + `setState` para leituras síncronas (ex.: `localStorage`).
- Extraia hooks `use*` quando a lógica for reutilizada.
- `useTranslation` do react-i18next para **todas** as strings visíveis ao usuário.

## Nomenclatura

| Elemento | Convenção | Exemplo |
|---|---|---|
| Arquivo de componente | PascalCase | `ClienteForm.tsx` |
| Arquivo de hook | camelCase, prefixo `use` | `useInvoiceShortcuts.ts` |
| Arquivo de locale | kebab-case, namespace | `clientes.json` |
| Classe CSS | Apenas utilitários Tailwind | — |
| Arquivo de teste | `<module>.test.ts` | `validators.test.ts` |
| `data-testid` | kebab-case, descritivo | `btn-save-cliente` |

## Temas (Tailwind)

- **`darkMode: 'class'`** — variantes `dark:` dependem da classe `dark` em um ancestral; neste projeto o controle está no **`<html>`**. Ver [temas-interface.md](temas-interface.md).
- **Padrão:** estilo claro como base; `dark:` para o modo escuro (sem duplicar a mesma cor).
- **Proibido em HTML estático:** `class="dark"` em `<body>`.

## Internacionalização

- Toda string visível usa `t('chave')` via `useTranslation`.
- Namespaces: `common`, `clientes`, `articulos`, `facturacion`.
- Após alterar chaves, execute `npm run check:i18n`.

## Acessibilidade

Ver [acessibilidade.md](acessibilidade.md). ESLint `jsx-a11y` em CI com `--max-warnings 0`.

## Testes

- Testes unitários em `src/lib/*.test.ts` e smoke a11y em `src/App.a11y.test.tsx`.
- **100%** de cobertura no escopo acordado: `src/lib/**/*.ts` e `server/createApp.ts` (ver [TESTING_STRATEGY](quality/estrategia-testes.md) e [ADR-0003](adr/ADR-0003-api-contract-testing.md)).
- Mock de HTTP com `vi.mock('axios')`; botões principais com `data-testid`.

## Comentários no código (trilíngue)

Para lógica não óbvia, use JSDoc com as três etiquetas obrigatórias `@en`, `@es`, `@pt-BR`. Exemplo completo em [inglês](../en/padroes-codigo.md#code-comments-trilingual). Não documentar comportamento sem evidência no código.

## Idiomas da documentação (Markdown)

Documentação de produto e qualidade em `docs/` nos diretórios `docs/en/`, `docs/es/`, `docs/pt-br/`. Ver [I18N_DOCUMENTATION.md](../I18N_DOCUMENTATION.md).

**Outros idiomas:** [English](../en/padroes-codigo.md) · [Español](../es/padroes-codigo.md)
