# Accesibilidad

BizCode apunta a conformidad **WCAG 2.2 nivel AA**.

## Política

- Prioridad teclado: todas las funciones sin ratón.
- Compatible con lector de pantalla: nombres accesibles en elementos interactivos.
- ESLint `jsx-a11y` en CI con **`npm run lint`** (`--max-warnings 0`): errores y advertencias bloquean el merge.

## Atajos de teclado

| Tecla | Acción |
|---|---|
| F2 | Enfocar búsqueda |
| F3 | Abrir formulario “Nuevo” |
| F5 | Guardar formulario |
| Ins | Agregar línea (factura) |
| Del | Quitar línea seleccionada |
| ↑ / ↓ | Navegar filas |
| Enter | Abrir fila para editar |
| Esc | Cerrar / cancelar |

## Patrones ARIA

Modales: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` al título.  
Formularios: `label`/`htmlFor`/`id`; errores con `role="alert"` y `aria-describedby`.  
Tablas: `aria-label`; filas con `role="row"` y `aria-selected` cuando aplique.

## Verificación

- **CI:** `src/App.a11y.test.tsx` con **jest-axe** en la ruta inicial (API mockeada).
- **Manual:** extensión axe DevTools antes del release.

**Otros idiomas:** [English](../en/accesibilidad.md) · [Português](../pt-br/accesibilidad.md)
