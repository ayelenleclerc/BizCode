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

## Cuenta corriente (GitHub #270)

En proveedores **existentes**, pestaña **Cuenta corriente**:

- **Saldo actual** (deuda acumulada por movimientos).
- Alerta si el saldo supera el **límite de crédito** configurado en la ficha.
- **Gráfico** de evolución de deuda (últimos 6 meses).
- **Tabla de movimientos** con filtros por tipo y rango de fechas.
- **Ajuste manual** (`suppliers.manage`): monto distinto de cero y motivo obligatorio; queda en auditoría (`proveedor_cc_ajuste`).

Al registrar un **comprobante de compra** activo (`POST /api/comprobantes-compra`, módulo `finance.ledger`) se genera automáticamente un movimiento `factura_compra` por el total del comprobante.

**API:** `GET /api/proveedores/{id}/cuenta-corriente`, `GET .../saldo`, `POST .../cuenta-corriente/ajuste` — [OpenAPI](../../api/openapi.yaml).

## Recibos de pago (GitHub #271)

En la pestaña **Cuenta corriente**, el bloque **Recibos de pago** permite registrar pagos al proveedor (módulo `finance.receipts`, `suppliers.manage`):

1. **Registrar pago** — se listan comprobantes pendientes (más antiguos primero); seleccioná líneas y montos (parcial o total).
2. Fecha, método (transferencia, cheque, efectivo, eCheq), CBU/referencia/notas opcionales.
3. Al guardar: número correlativo por tenant, movimiento `pago` en CC (monto negativo) y auditoría `recibo_pago_create`.
4. **Descargar PDF** por recibo; **Anular** (`recibo_pago_void`) revierte el saldo con movimiento compensatorio.

**API:** `GET /api/proveedores/{id}/pagos/comprobantes-pendientes`, `GET/POST /api/proveedores/{id}/pagos`, `POST .../pagos/{reciboId}/anular`, `GET .../pagos/{reciboId}/pdf` — [OpenAPI](../../api/openapi.yaml).

## Alertas de vencimiento a pagar (GitHub #275)

Módulo `finance.ledger`, permiso `suppliers.read`:

- **Vencimiento** en `ComprobanteCompra`: campo opcional `vencimiento` al alta; si falta, `fecha` + `plazoHabitual` / `condicionPago` del proveedor.
- **Listado** de impagos: `GET /api/proveedores/facturas-pendientes` (filtros `estado`, `proveedorId`).
- **Inicio** — widget con totales vencidas y próximas a vencer.
- **Finanzas** — tabla filtrada de facturas a pagar.
- **Configuración empresa** — umbrales de alerta, toggle in-app; email reservado para futuro destinatario SMTP.
- **Job diario** `scripts/proveedor-alertas-job.ts` a las 07:00 hora del tenant; deduplicación `AlertaProveedorLog`.
- **Límite de crédito** — alerta in-app al registrar comprobante si el saldo supera `limiteCredito`.

**API:** `GET/PATCH /api/configuracion/alertas-proveedores` — [OpenAPI](../../api/openapi.yaml).

## Baja lógica

**Dar de baja** pone `activo: false` sin borrar el registro (órdenes de compra y comprobantes existentes siguen referenciando al proveedor). Usá el filtro de inactivos para revisarlos.

## Importación CSV

La plantilla fija incluye columnas básicas; los campos bancarios/comerciales se cargan por UI o API tras la importación.

**API:** `GET/POST /api/proveedores`, `GET/PUT/DELETE /api/proveedores/{id}` — véase [OpenAPI](../../api/openapi.yaml).

**Otros idiomas:** [English](../../en/user/manual-suppliers.md) · [Português](../../pt-br/user/manual-fornecedores.md)
