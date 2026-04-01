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

## Rubros

Los rubros son las categorías de artículos (ej: "Herramientas", "Electrónica", "Librería"). Para agregar rubros, contacte al administrador del sistema (actualmente gestionados directamente en la base de datos).

## Atajos de Teclado

| Tecla | Acción |
|---|---|
| F2 | Enfocar campo de búsqueda |
| F3 | Abrir formulario Nuevo artículo |
| F5 | Guardar formulario |
| ↑ / ↓ | Navegar filas de la tabla |
| Enter | Abrir artículo seleccionado |
| Esc | Cerrar formulario sin guardar |
