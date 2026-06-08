# Manual de Usuario: Artículos

## Acceso

Haga clic en **Artículos** en el menú lateral izquierdo.

## Listado de Artículos

Muestra: Código, Descripción, Rubro, IVA, Precio Lista 1, Precio Lista 2, Stock y Activo.

**Buscar:** Escriba en el campo de búsqueda (**F2**) para filtrar por código o descripción.

**Navegar:** Use **↑** / **↓** para moverse entre filas.

## Crear un Artículo Nuevo

1. Presione **F3** o haga clic en **➕ Nuevo**.
2. Complete el formulario.
3. Presione **F5** o **Guardar**.

### Campos del Formulario

| Campo | Obligatorio | Descripción |
|---|---|---|
| Código | Sí | Número de artículo (no editable después de creado). |
| Descripción | Sí | Nombre del artículo. Mínimo 3, máximo 30 caracteres. |
| Rubro | Sí | Categoría del artículo. Debe existir en el catálogo de rubros. |
| U. Medida | Sí | Unidad de venta (ej: U, kg, l, cj). Mínimo 2 caracteres. |
| Condición IVA | Sí | Alícuota de IVA del artículo (ver tabla abajo). |
| P. Lista 1 | Sí | Precio de lista principal. Número positivo con hasta 2 decimales. |
| P. Lista 2 | Sí | Precio de lista alternativo (ej: mayorista). |
| Costo | Sí | Costo del artículo (para cálculo de margen). |
| Stock | Sí | Cantidad en inventario. Número entero no negativo. |
| Mínimo | Sí | Stock mínimo para alertas de reposición. |
| Activo | Sí | Desmarcar para retirar el artículo de la venta. |

### Condición IVA del Artículo

| Valor | Alícuota |
|---|---|
| **21%** | IVA general (mayoría de los bienes) |
| **10.5%** | IVA reducido (alimentos básicos, libros, medicamentos) |
| **Exento** | Sin IVA (exportaciones, servicios educativos, etc.) |

La condición IVA del **artículo** determina la alícuota aplicable. La condición IVA del **cliente** determina cómo se presenta el IVA en la factura (desglosado en Factura A, o incluido en Factura B).

## Editar un Artículo

1. Seleccione el artículo en la tabla.
2. Presione **Enter** o haga doble clic.
3. Modifique los campos y presione **F5**.

## Comparador de proveedores (GitHub #274)

En artículos **existentes** (`logistics.purchases`, `products.read` o `suppliers.read`):

- Pulse **Ver proveedores** debajo del campo de stock para desplegar el comparador.
- **Tabla:** proveedor, código del proveedor, precio de lista, última actualización de precio y última compra (desde OC **recibidas** con cantidad recibida &gt; 0).
- Se **resalta** la fila del proveedor más barato entre quienes tienen precio de lista.
- **Precio desactualizado:** resaltado ámbar si la fecha del precio supera **30** días.
- **Orden:** por precio, fecha de precio o última compra (ascendente/descendente); los valores nulos quedan al final.
- **[OC]** (`suppliers.manage`): abre **Compras** con proveedor, artículo y costo unitario precargados en el formulario de nueva orden.

Solo aparecen proveedores **activos** con entrada de catálogo **activa** para el artículo.

**API:** `GET /api/articulos/{id}/proveedores`, `GET /api/proveedores/comparar?articuloId=` — [OpenAPI](../../api/openapi.yaml).

## Rubros

Los rubros son las categorías de artículos (ej: "Herramientas", "Electrónica", "Librería"). Quienes tengan permiso de gestión de productos pueden **importar rubros desde CSV** desde esta misma pantalla (botón «Importar rubros CSV»): descargue la plantilla, no modifique la fila de encabezados, use UTF-8 y revise el resumen de filas creadas u omitidas.

## Importación CSV (rubros y artículos)

Con permiso **products.manage**:

- **Rubros:** columnas fijas `codigo`, `nombre`. Archivo `.csv`, tamaño y filas máximas según el texto de ayuda del cuadro de importación. No se vuelven a crear códigos que ya existan en la base ni duplicados dentro del mismo archivo.
- **Artículos:** columnas según la plantilla; **`rubroCodigo`** debe coincidir con el **código numérico** de un rubro ya existente. Misma política de duplicados por `codigo` de artículo (archivo y base). La validación por fila es la misma que la API REST; los errores incluyen prefijo de **campo** (p. ej. `descripcion: …`).

**Esc** cierra el cuadro de importación si está abierto; si no, cierra el formulario de artículo.

## Atajos de Teclado

| Tecla | Acción |
|---|---|
| F2 | Enfocar campo de búsqueda |
| F3 | Abrir formulario Nuevo artículo |
| F5 | Guardar formulario |
| ↑ / ↓ | Navegar filas de la tabla |
| Enter | Abrir artículo seleccionado |
| Esc | Cerrar importación CSV, o formulario sin guardar |
