# Coding Standards

## TypeScript

- Strict mode is enforced (`tsconfig.json`: `"strict": true`).
- `any` is prohibited as an error; annotate with `unknown` and narrow types, or use `// eslint-disable-next-line @typescript-eslint/no-explicit-any` with a comment explaining why.
- Prefer `interface` for object shapes exposed as API contracts; use `type` for unions, intersections, and utility types.
- All function parameters and return types must be explicitly typed (no implicit `any`).

## React

- Functional components only; no class components.
- Prefer `useState` lazy initializers over `useEffect` + `setState` for one-time initialization from synchronous sources (e.g., `localStorage`).
- Custom hooks (`use*`) must be extracted when logic is reused across more than one component.
- `useTranslation` from react-i18next must be used for **all** user-visible strings. No hardcoded UI text.

## Naming

| Element | Convention | Example |
|---|---|---|
| React component file | PascalCase | `ClienteForm.tsx` |
| Hook file | camelCase, prefix `use` | `useInvoiceShortcuts.ts` |
| Locale file | kebab-case namespace | `clientes.json` |
| CSS class | Tailwind utility classes only | — |
| Test file | `<module>.test.ts` | `validators.test.ts` |
| `data-testid` | kebab-case, descriptive | `btn-save-cliente` |

## Theming (Tailwind)

- **`darkMode: 'class'`** — `dark:` variants depend on the `dark` class on an ancestor; in this project control lives on **`<html>`** (`Layout` + script in `index.html`). See [theming.md](theming.md).
- **Pattern:** light-mode styles as the base; overrides with `dark:` (do not duplicate the same colour in base and `dark:`).
- **Forbidden in static HTML:** `class="dark"` on `<body>` (breaks the toggle). See [theming.md](theming.md#why-dark-only-on-html).

## Internationalization

- Every user-visible string must use `t('key')` from the nearest `useTranslation` call.
- Namespace per module: `common`, `clientes`, `articulos`, `facturacion`.
- After adding or removing keys, run `npm run check:i18n` to keep `en` and `pt-BR` in sync.
- Keys use dot notation and camelCase segments: `form.titleEdit`, `errors.noCliente`.

## Accessibility

See [accessibility.md](accessibility.md) for the full policy.

Minimum requirements enforced by ESLint (`jsx-a11y`):
- Every `<img>` must have `alt`.
- Every form control must have an associated `<label>` (via `htmlFor`/`id`).
- Interactive elements must be focusable and keyboard-operable.
- Modals: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the heading.
- Required fields: `aria-required="true"`.
- Error messages: `role="alert"`, referenced via `aria-describedby` on the input.

## Testing

- Unit tests live in `src/lib/*.test.ts` (and a11y smoke in `src/App.a11y.test.tsx`).
- **100%** coverage (lines, functions, branches, statements) in the agreed scope: `src/lib/**/*.ts` and `server/createApp.ts` (see [quality/testing-strategy.md](quality/testing-strategy.md) and [adr/ADR-0003-api-contract-testing.md](adr/ADR-0003-api-contract-testing.md)). Extending scope requires new thresholds and, if applicable, an **ADR**.
- Tests must not mock the database; use `vi.mock('axios')` to isolate the HTTP layer.
- Every primary action button must have a `data-testid` for future E2E use.

## Code comments (trilingual)

For non-obvious logic (algorithms, workarounds, invariants), use a JSDoc block on the function or block with **three** tags — all required when the comment explains behaviour:

```ts
/**
 * @en Validates Argentine CUIT check digit (modulo 11).
 * @es Valida el dígito verificador del CUIT argentino (módulo 11).
 * @pt-BR Valida o dígito verificador do CUIT argentino (módulo 11).
 */
```

Trivial comments (e.g. `// increment counter`) do not need trilingual text. **Do not** state behaviour that is not evidenced in code.

## Repository documentation languages

Product and quality Markdown under `docs/` is maintained in **English** (`docs/en/`), **Spanish** (`docs/es/`), and **Brazilian Portuguese** (`docs/pt-br/`). See [I18N_DOCUMENTATION.md](../I18N_DOCUMENTATION.md).
