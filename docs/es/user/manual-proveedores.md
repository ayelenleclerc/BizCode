# Manual de usuario — Proveedores

**Permisos:** `suppliers.read` (listar y ver), `suppliers.manage` (alta, edición, baja lógica, importación CSV).

## Listado

- Búsqueda por código o razón social (F2 enfoca el campo).
- Filtros por **estado** (todos / activos / inactivos) y **categoría** (materia prima, insumos, servicios, logística).
- Badges en tabla: **activo** / **inactivo**.

## Ficha completa (GitHub #269)

**Nuevo** (F3) o fila seleccionada + **Editar**. Secciones del formulario:

1. **Datos generales** — código, categoría, razón social, fantasía, CUIT (validado), condición IVA, teléfono, email, activo.
2. **Datos bancarios** — CBU (dígito verificador), alias, banco, tipo de cuenta, moneda (ARS por defecto).
3. **Condición comercial** — condición de pago, plazo habitual, descuento %, límite de crédito.
4. **Contacto y notas** — nombre, email y teléfono de contacto, notas.

Atajos: **F5** guardar, **Esc** cancelar.

## Baja lógica

**Dar de baja** pone `activo: false` sin borrar el registro (órdenes de compra y comprobantes existentes siguen referenciando al proveedor). Usá el filtro de inactivos para revisarlos.

## Importación CSV

La plantilla fija incluye columnas básicas; los campos bancarios/comerciales se cargan por UI o API tras la importación.

**API:** `GET/POST /api/proveedores`, `GET/PUT/DELETE /api/proveedores/{id}` — véase [OpenAPI](../../api/openapi.yaml).

**Otros idiomas:** [English](../../en/user/manual-suppliers.md) · [Português](../../pt-br/user/manual-fornecedores.md)
