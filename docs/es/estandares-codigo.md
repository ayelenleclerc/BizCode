# Estándares de código

## TypeScript

- Modo strict obligatorio (`tsconfig.json`: `"strict": true`).
- `any` está prohibido como error; use `unknown` y estreche tipos, o `// eslint-disable-next-line @typescript-eslint/no-explicit-any` con comentario.
- Prefiera `interface` para formas expuestas como contrato de API; use `type` para uniones e intersecciones.
- Parámetros y retornos deben estar tipados explícitamente.

## React

- Solo componentes funcionales.
- Prefiera inicializadores perezosos de `useState` frente a `useEffect` + `setState` para lecturas síncronas (p. ej. `localStorage`).
- Extraiga hooks `use*` cuando la lógica se reutilice.
- `useTranslation` de react-i18next para **todas** las cadenas visibles al usuario.

## Nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivo de componente React | PascalCase | `ClienteForm.tsx` |
| Archivo de hook | camelCase, prefijo `use` | `useInvoiceShortcuts.ts` |
| Archivo de locale | namespace kebab-case | `clientes.json` |
| Clase CSS | Solo utilidades Tailwind | — |
| Archivo de test | `<módulo>.test.ts` | `validators.test.ts` |
| `data-testid` | kebab-case, descriptivo | `btn-save-cliente` |

## Theming (Tailwind)

- **`darkMode: 'class'`** — las variantes `dark:` dependen de la clase `dark` en un ancestro; en este proyecto el control vive en **`<html>`** (`Layout` + script en `index.html`). Ver [temas-interfaz.md](temas-interfaz.md).
- **Patrón:** estilos de modo claro como base; overrides con `dark:` (no duplicar el mismo color en base y en `dark:`).
- **Prohibido en HTML estático:** `class="dark"` en `<body>` (rompe el conmutador). Evidencia: [temas-interfaz.md](temas-interfaz.md#por-qué-la-clase-dark-solo-en-html).

## Documentación del repositorio (Markdown)

La documentación de producto y calidad en `docs/` se mantiene en **inglés** (`docs/en/`), **español** (`docs/es/`) y **portugués brasileño** (`docs/pt-br/`). Ver [I18N_DOCUMENTATION.md](../I18N_DOCUMENTATION.md).

## Internacionalización

- Toda cadena visible usa `t('clave')` con `useTranslation`.
- Namespaces: `common`, `clientes`, `articulos`, `facturacion`.
- Tras añadir o quitar claves, ejecute `npm run check:i18n`.
- Claves con notación punto y camelCase: `form.titleEdit`, `errors.noCliente`.

## Accesibilidad

Ver [accesibilidad.md](accesibilidad.md). ESLint `jsx-a11y` en CI con `--max-warnings 0`.

## Pruebas

- Tests en `src/lib/*.test.ts` y smoke a11y en `src/App.a11y.test.tsx`.
- **100%** de cobertura en `src/lib/**/*.ts` y `server/createApp.ts` (véase [TESTING_STRATEGY](quality/estrategia-pruebas.md) y [ADR-0003](adr/ADR-0003-api-contract-testing.md)).
- Mock de HTTP con `vi.mock('axios')`; botones principales con `data-testid`.

## Comentarios en código (trilingües)

Para lógica no obvia, use JSDoc con las tres etiquetas **obligatorias** `@en`, `@es`, `@pt-BR` (una frase cada una). Véase el ejemplo en [inglés](../en/estandares-codigo.md#code-comments-trilingual). No documentar comportamiento no evidenciado en el código.

**Otros idiomas:** [English](../en/estandares-codigo.md) · [Português](../pt-br/estandares-codigo.md)
