# Manual de Usuario: Facturación

## Acceso

Haga clic en **Facturación** en el menú lateral izquierdo.

## Listado de Facturas

Muestra todas las facturas emitidas con: Fecha, Tipo (A/B), Número, Cliente, Neto, IVA, Total y Estado (Activa/Anulada).

**Ver detalle:** Haga clic en una factura para expandir el detalle con el desglose de ítems e IVA.

## Emitir una Factura Nueva

1. Presione **F3** o haga clic en **➕ Nueva Factura**.
2. Complete la cabecera.
3. Agregue los ítems.
4. Presione **F5** o **✓ Guardar Factura**.

### Cabecera de la Factura

| Campo | Obligatorio | Descripción |
|---|---|---|
| Tipo | Sí | **Factura A** (cliente RI) o **Factura B** (CF, Mono). |
| Prefijo | No | Punto de venta (hasta 4 caracteres, ej: `0001`). |
| Número | Sí | Número de comprobante. |
| Fecha | Sí | Fecha de emisión (predeterminada: hoy). |
| Cliente | Sí | Seleccione el cliente de la lista desplegable. |

### Selección del Tipo de Factura

- **Factura A**: Para clientes con condición IVA = **RI**. El IVA se muestra desglosado. El cliente puede tomar crédito fiscal.
- **Factura B**: Para clientes **CF**, **Mono**, o **Exento**. El IVA está incluido en el precio (no se desglosa).

### Agregar Ítems

1. Presione **Ins** o el botón **➕ Agregar Ítem** para añadir una línea.
2. En cada línea seleccione el **Artículo** de la lista desplegable. El precio se completa automáticamente con el Precio Lista 1.
3. Ingrese la **Cantidad** (predeterminada: 1).
4. Modifique el **Precio** si corresponde.
5. Ingrese el **Descuento %** (0 = sin descuento).
6. El **Subtotal** se calcula automáticamente: `Cantidad × Precio × (1 - Dscto%/100)`.

Para **eliminar** un ítem: selecciónelo con clic y presione **Del**.

### Cálculo Automático de Totales

Los totales se actualizan automáticamente al modificar cualquier ítem o cambiar el cliente:

| Columna | Descripción |
|---|---|
| **Neto 21%** | Suma de subtotales de artículos con IVA 21% (sin IVA) |
| **Neto 10.5%** | Suma de subtotales de artículos con IVA 10.5% (sin IVA) |
| **Neto Exento** | Suma de subtotales de artículos exentos |
| **IVA** | Total de IVA (21% + 10.5%). Para CF/Mono: se muestra pero no se desglosa en la factura |
| **TOTAL** | Neto total + IVA total |

**Nota importante:** Para clientes **CF** (Consumidor Final) y **Mono** (Monotributo), el total incluye IVA pero el sistema no lo desglosa en el comprobante (Factura B). El IVA se sigue calculando internamente para los registros contables del emisor.

### Guardar la Factura

Una vez completa la cabecera y al menos un ítem:
- Presione **F5** o el botón **✓ Guardar Factura (F5)**.
- La factura queda grabada y el sistema vuelve al listado.

## Atajos de Teclado

| Tecla | Acción |
|---|---|
| F3 | Abrir formulario Nueva Factura |
| Ins | Agregar ítem al listado |
| Del | Eliminar ítem seleccionado |
| F5 | Guardar factura |
| Esc | Cancelar y volver al listado |

## Preguntas Frecuentes

**¿Qué pasa si selecciono el tipo incorrecto (A vs B)?**
El tipo de factura no se puede modificar una vez guardada. Deberá anular la factura y emitir una nueva. Contacte al administrador para anular comprobantes.

**¿Puedo modificar una factura guardada?**
No. Las facturas son comprobantes fiscales inmutables. Si hay un error, la factura debe anularse y emitirse una nueva.

**¿Por qué el botón Guardar está deshabilitado?**
El botón se habilita solo cuando hay al menos un ítem y un cliente seleccionado.
