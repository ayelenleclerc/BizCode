# Tema claro / escuro (UI)

Este documento descreve o comportamento **evidenciado no código** do seletor de tema do aplicativo desktop (React + Tailwind no WebView Tauri).

## Resumo

| Aspecto | Implementação |
|--------|----------------|
| Motor de estilos | Tailwind CSS 3 (`tailwind.config.js`: `darkMode: 'class'`) |
| Persistência | `localStorage`, chave `theme`, valores `dark` \| `light` |
| Padrão (sem chave salva) | Modo **escuro** (mesma lógica em [`index.html`](../../index.html) e [`src/components/layout/Layout.tsx`](../../src/components/layout/Layout.tsx)) |
| Onde fica a classe `dark` | Apenas no **`<html>`** (`document.documentElement`), nunca fixa em `<body>` |

## Por que `dark` só no `<html>`

Com `darkMode: 'class'`, o Tailwind aplica utilitários `dark:*` quando **qualquer ancestral** do elemento tem a classe `dark`.

Se `<body>` tiver `class="dark"` fixa, **toda a árvore da SPA continua “escura”** mesmo que o React remova `dark` do `<html>`. O botão em `Layout` deixa de ter efeito visual.

**Regra:** não adicionar `dark` ao `<body>` em [`index.html`](../../index.html). O tema é controlado apenas pelas classes em `<html>` (`dark` / `light`).

## Ordem de carregamento (sem flash)

1. **Script inline no `<head>`** ([`index.html`](../../index.html)): antes do primeiro paint, lê `localStorage.getItem('theme')` e aplica `dark` ou `light` em `document.documentElement`, com o mesmo padrão que `Layout` (sem chave → escuro).
2. **React (`Layout`)**: ao montar e ao mudar o estado, sincroniza `dark` / `light` no `<html>` e grava `localStorage`.

## Estilos globais

[`src/index.css`](../../src/index.css): o `body` usa utilitários com variantes `dark:`. `html.dark` / `html.light` definem `color-scheme` para controles nativos.

## Componentes e páginas

- **Shell:** [`src/components/layout/Layout.tsx`](../../src/components/layout/Layout.tsx) (botão de tema, `type="button"`).
- **Vistas/formulários:** modo claro como base e **`dark:`** para o escuro. Evite redundâncias como `bg-slate-900 dark:bg-slate-900`.

## Chaves i18n

Namespace `common`, chaves `theme.switchToLight` e `theme.switchToDark` ([`src/i18n/`](../../src/i18n/)).

## Alterações futuras

Qualquer mudança no contrato do tema deve atualizar **este arquivo**, [`index.html`](../../index.html) e `Layout.tsx`, e constar no [historico-de-alteracoes.md](historico-de-alteracoes.md) se for visível ao usuário.

**Outros idiomas:** [English](../en/temas-interface.md) · [Español](../es/temas-interface.md)
