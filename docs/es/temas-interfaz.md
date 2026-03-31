# Tema claro / oscuro (UI)

Este documento describe el comportamiento **evidenciado en el código** del conmutador de tema de la aplicación desktop (React + Tailwind en WebView Tauri).

## Resumen

| Aspecto | Implementación |
|--------|----------------|
| Motor de estilos | Tailwind CSS 3 (`tailwind.config.js`: `darkMode: 'class'`) |
| Persistencia | `localStorage`, clave `theme`, valores `dark` \| `light` |
| Valor por defecto (sin clave guardada) | Modo **oscuro** (misma lógica en [`index.html`](../../index.html) y [`src/components/layout/Layout.tsx`](../../src/components/layout/Layout.tsx)) |
| Dónde va la clase `dark` | Solo en **`<html>`** (`document.documentElement`), nunca fija en `<body>` |

## Por qué la clase `dark` solo en `<html>`

Con `darkMode: 'class'`, Tailwind aplica las utilidades `dark:*` cuando **cualquier ancestro** del elemento tiene la clase `dark`.

Si `<body>` lleva `class="dark"` de forma fija, **todo el árbol de la SPA sigue considerándose “oscuro”** aunque React quite `dark` del `<html>`. El conmutador en `Layout` deja de tener efecto visual.

**Regla:** no añadir `dark` al `<body>` en [`index.html`](../../index.html). El tema se controla únicamente con las clases en `<html>` (`dark` / `light`).

## Orden de carga (sin parpadeo)

1. **Script inline en `<head>`** ([`index.html`](../../index.html)): antes del primer paint, lee `localStorage.getItem('theme')` y aplica en `document.documentElement` las clases `dark` o `light`, con la misma regla por defecto que `Layout` (sin clave → oscuro).
2. **React (`Layout`)**: al montar y al cambiar el estado, sincroniza de nuevo `dark` / `light` en `<html>` y escribe `localStorage`.

Así se evita un destello de tema incorrecto mientras carga el bundle.

## Estilos globales

[`src/index.css`](../../src/index.css): el `body` usa utilidades con variantes `dark:` (fondo y texto coherentes con el modo). `html.dark` / `html.light` fijan `color-scheme` para controles nativos del navegador/WebView.

## Componentes y páginas

- **Shell y navegación:** [`src/components/layout/Layout.tsx`](../../src/components/layout/Layout.tsx) (botón de tema, `type="button"`).
- **Vistas y formularios:** utilizar **modo claro como base** y **`dark:`** para el modo oscuro (p. ej. `bg-slate-50 dark:bg-slate-900`, `text-slate-900 dark:text-slate-100`). Evitar `bg-slate-900 dark:bg-slate-900` u otras redundancias que impidan ver el cambio.

## Claves i18n

Textos del botón: namespace `common`, claves `theme.switchToLight` y `theme.switchToDark` (véase configuración i18n en [`src/i18n/`](../../src/i18n/)).

## Cambios futuros

Cualquier ajuste al contrato del tema (clave de `localStorage`, valor por defecto, o clases en el documento) debe actualizar **este archivo**, [`index.html`](../../index.html) y `Layout.tsx` de forma coherente, y reflejarse en [historial-de-cambios.md](historial-de-cambios.md) si el cambio es visible para el usuario.
