# Accessibility

BizCode targets **WCAG 2.2 Level AA** conformance.

## Policy

- Keyboard-first: every feature must be fully operable without a mouse.
- Screen-reader compatible: all interactive elements must have accessible names.
- ESLint `jsx-a11y` runs in CI with **`npm run lint`** (`--max-warnings 0`): errors and warnings block merge.

## Keyboard Shortcuts

| Key | Action |
|---|---|
| F2 | Focus search input |
| F3 | Open "New record" form |
| F5 | Save current form |
| Ins | Add line item (invoice form) |
| Del | Remove selected line item |
| ↑ / ↓ | Navigate table rows |
| Enter | Open selected row for editing |
| Esc | Close form / cancel |

## ARIA Patterns

### Modal Dialogs
Every modal (`ClienteForm`, `ArticuloForm`, `NuevaFacturaForm` / `ListadoFacturas` detail) must have:

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-<entity>-title"
>
  <h2 id="dialog-<entity>-title">...</h2>
```

### Form Controls
Every input must have an associated label via matching `htmlFor` / `id`:

```tsx
<label htmlFor="cliente-rsocial">Razón Social *</label>
<input id="cliente-rsocial" aria-required="true" ... />
```

Fields with validation errors must reference the error element:

```tsx
<input aria-describedby={errors.rsocial ? 'cliente-rsocial-error' : undefined} />
{errors.rsocial && <p id="cliente-rsocial-error" role="alert">...</p>}
```

### Tables
```tsx
<table aria-label={t('title')}>
  <tr role="row" aria-selected={isSelected}>
```

### Error Messages
Non-form errors (e.g., API failures) must use `role="alert"`:
```tsx
<div role="alert" className="...">
  {errorMessage}
</div>
```

## Verification

- **CI:** `src/App.a11y.test.tsx` runs **jest-axe** on the initial route (customer list) with the API mocked; `expect(results.violations).toHaveLength(0)`.
- **Manual:** axe DevTools extension on each page and zero critical violations before release.

Relevant `jsx-a11y` rules (among others from the recommended preset):
- `alt-text`, `aria-props`, `aria-role`, `aria-unsupported-elements`
- `label-has-associated-control` (association via `htmlFor`/id or nesting)
- `interactive-supports-focus`, `click-events-have-key-events`
- `no-static-element-interactions`
