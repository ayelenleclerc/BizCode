# Design system `@bizcode/ui` (#157)

## Propósito

Documenta o package compartilhado `packages/ui` (`@bizcode/ui`): entry points duais web e React Native, primitivos MVP, peers e adoção smoke. **Não é uma afirmação de certificação.**

## Entry points

| Import | Plataforma | Implementação |
|--------|------------|---------------|
| `@bizcode/ui` | Compartilhado | Tipos de props, `formatCurrency`, `resolveStatusTone` |
| `@bizcode/ui/web` | DOM (`apps/web`) | Markup compatível com Tailwind (sem Paper, sem `react-native-web`) |
| `@bizcode/ui/native` | Expo (`apps/driver`, `apps/seller`) | Wrappers finos sobre **react-native-paper** `^5.15.3` |

## Componentes MVP

`Button` (variantes: primary, secondary, danger, ghost), `Badge` (tons: success, warning, error, info), `Card`, `Avatar`, `Spinner`, `StatusBadge`, `CurrencyText`.

- **StatusBadge:** mapeia strings de status Pedido / OE / Reparto / parada de rota para tons de badge (sem chamadas API).
- **CurrencyText:** `Intl.NumberFormat` com prop `locale` (`es-AR` / `en-US` / `pt-BR`); moeda padrão `ARS`. Sem i18n React dentro do package.

## Peers

- **Todos:** `react` ≥ 18
- **Somente native:** `react-native`, `react-native-paper` `^5.15.3` (peers opcionais; fornecidos pelos apps móveis)

## Storybook

Fora do escopo de #157 (AC do issue opcional). A API dos componentes é documentada aqui; Storybook pode ser adicionado depois sem bloquear type-check.

## Adoção smoke (evidência)

- Web: `LoadingSpinner` usa `Spinner` de `@bizcode/ui/web`.
- Driver / Seller: carregamento do perfil usa `Spinner` de `@bizcode/ui/native` sob o `PaperProvider` existente.

A migração em massa de telas está fora do escopo.

## Verificar

```bash
pnpm --filter @bizcode/ui type-check
pnpm --filter @bizcode/web type-check
pnpm --filter @bizcode/driver type-check
pnpm --filter @bizcode/seller type-check
pnpm exec vitest run packages/ui/src
```
