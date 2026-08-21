# Design system `@bizcode/ui` (#157)

## Propósito

Documenta el package compartido `packages/ui` (`@bizcode/ui`): entry points duales web y React Native, primitivos MVP, peers y adopción smoke. **No es una afirmación de certificación.**

## Entry points

| Import | Plataforma | Implementación |
|--------|------------|----------------|
| `@bizcode/ui` | Compartido | Tipos de props, `formatCurrency`, `resolveStatusTone` |
| `@bizcode/ui/web` | DOM (`apps/web`) | Markup compatible con Tailwind (sin Paper, sin `react-native-web`) |
| `@bizcode/ui/native` | Expo (`apps/driver`, `apps/seller`) | Wrappers delgados sobre **react-native-paper** `^5.15.3` |

## Componentes MVP

`Button` (variantes: primary, secondary, danger, ghost), `Badge` (tonos: success, warning, error, info), `Card`, `Avatar`, `Spinner`, `StatusBadge`, `CurrencyText`.

- **StatusBadge:** mapea strings de estado Pedido / OE / Reparto / parada de ruta a tonos de badge (sin llamadas API).
- **CurrencyText:** `Intl.NumberFormat` con prop `locale` (`es-AR` / `en-US` / `pt-BR`); moneda por defecto `ARS`. Sin i18n React dentro del package.

## Peers

- **Todos:** `react` ≥ 18
- **Solo native:** `react-native`, `react-native-paper` `^5.15.3` (peers opcionales; los aportan las apps móviles)

## Storybook

Fuera de alcance de #157 (AC del issue opcional). La API de componentes se documenta aquí; Storybook puede añadirse después sin bloquear type-check.

## Adopción smoke (evidencia)

- Web: `LoadingSpinner` usa `Spinner` de `@bizcode/ui/web`.
- Driver / Seller: carga de perfil usa `Spinner` de `@bizcode/ui/native` bajo el `PaperProvider` existente.

La migración masiva de pantallas está fuera de alcance.

## Verificar

```bash
pnpm --filter @bizcode/ui type-check
pnpm --filter @bizcode/web type-check
pnpm --filter @bizcode/driver type-check
pnpm --filter @bizcode/seller type-check
pnpm exec vitest run packages/ui/src
```
