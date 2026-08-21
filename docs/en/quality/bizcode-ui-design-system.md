# `@bizcode/ui` design system (#157)

## Purpose

Documents the shared UI package `packages/ui` (`@bizcode/ui`): dual entry points for web and React Native, MVP primitives, peers, and smoke adoption. **Not a certification claim.**

## Entry points

| Import | Platform | Implementation |
|--------|----------|----------------|
| `@bizcode/ui` | Shared | Prop types, `formatCurrency`, `resolveStatusTone` |
| `@bizcode/ui/web` | DOM (`apps/web`) | Tailwind-compatible markup (no Paper, no `react-native-web`) |
| `@bizcode/ui/native` | Expo (`apps/driver`, `apps/seller`) | Thin wrappers over **react-native-paper** `^5.15.3` |

## MVP components

`Button` (variants: primary, secondary, danger, ghost), `Badge` (tones: success, warning, error, info), `Card`, `Avatar`, `Spinner`, `StatusBadge`, `CurrencyText`.

- **StatusBadge:** maps Pedido / OE / Reparto / ruta-parada status strings to badge tones (no API calls).
- **CurrencyText:** `Intl.NumberFormat` with locale prop (`es-AR` / `en-US` / `pt-BR`); default currency `ARS`. No React i18n inside the package.

## Peers

- **All:** `react` ≥ 18
- **Native only:** `react-native`, `react-native-paper` `^5.15.3` (optional peers; provided by mobile apps)

## Storybook

Out of scope for #157 (issue AC optional). Component API is documented here; Storybook may be added later without blocking type-check.

## Smoke adoption (evidence)

- Web: `LoadingSpinner` uses `Spinner` from `@bizcode/ui/web`.
- Driver / Seller: Profile loading uses `Spinner` from `@bizcode/ui/native` under existing `PaperProvider`.

Mass screen migration is out of scope.

## Verify

```bash
pnpm --filter @bizcode/ui type-check
pnpm --filter @bizcode/web type-check
pnpm --filter @bizcode/driver type-check
pnpm --filter @bizcode/seller type-check
pnpm exec vitest run packages/ui/src
```
