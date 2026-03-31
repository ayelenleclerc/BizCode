# Light / dark theme (UI)

This document describes the behaviour **evidenced in the code** for the desktop app theme switcher (React + Tailwind in the Tauri WebView).

## Summary

| Aspect | Implementation |
|--------|----------------|
| Styling engine | Tailwind CSS 3 (`tailwind.config.js`: `darkMode: 'class'`) |
| Persistence | `localStorage`, key `theme`, values `dark` \| `light` |
| Default (no saved key) | **Dark** mode (same logic in [`index.html`](../../index.html) and [`src/components/layout/Layout.tsx`](../../src/components/layout/Layout.tsx)) |
| Where `dark` applies | Only on **`<html>`** (`document.documentElement`), never fixed on `<body>` |

## Why `dark` only on `<html>`

With `darkMode: 'class'`, Tailwind applies `dark:*` utilities when **any ancestor** of the element has the `dark` class.

If `<body>` has a fixed `class="dark"`, the **entire SPA tree is still treated as “dark”** even if React removes `dark` from `<html>`. The toggle in `Layout` then has no visible effect.

**Rule:** do not add `dark` to `<body>` in [`index.html`](../../index.html). The theme is controlled only via classes on `<html>` (`dark` / `light`).

## Load order (no flash)

1. **Inline script in `<head>`** ([`index.html`](../../index.html)): before first paint, reads `localStorage.getItem('theme')` and applies `dark` or `light` on `document.documentElement`, with the same default as `Layout` (no key → dark).
2. **React (`Layout`)**: on mount and when state changes, syncs `dark` / `light` on `<html>` and writes `localStorage`.

This avoids a wrong-theme flash while the bundle loads.

## Global styles

[`src/index.css`](../../src/index.css): `body` uses utilities with `dark:` variants (background and text aligned with the mode). `html.dark` / `html.light` set `color-scheme` for native browser/WebView controls.

## Components and pages

- **Shell and navigation:** [`src/components/layout/Layout.tsx`](../../src/components/layout/Layout.tsx) (theme button, `type="button"`).
- **Views and forms:** use **light mode as the base** and **`dark:`** for dark mode (e.g. `bg-slate-50 dark:bg-slate-900`, `text-slate-900 dark:text-slate-100`). Avoid `bg-slate-900 dark:bg-slate-900` or other redundancies that prevent visible switching.

## i18n keys

Button labels: namespace `common`, keys `theme.switchToLight` and `theme.switchToDark` (see i18n config under [`src/i18n/`](../../src/i18n/)).

## Future changes

Any change to the theme contract (`localStorage` key, default value, or document classes) must update **this file**, [`index.html`](../../index.html), and `Layout.tsx` consistently, and be reflected in [changelog.md](changelog.md) if user-visible.
