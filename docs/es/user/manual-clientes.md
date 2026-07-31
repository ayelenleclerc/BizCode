# Manual de Usuario: Clientes

## Acceso

Haga clic en **Clientes** en el menú lateral izquierdo, o navegue con las teclas de flecha y presione Enter.

## Listado de Clientes

Al abrir la sección verá la tabla de clientes con: Código, Razón Social, CUIT, Condición IVA, Teléfono y estado Activo.

**Buscar:** Escriba en el campo de búsqueda (o presione **F2** para enfocar el campo). La lista se filtra automáticamente por Razón Social o CUIT.

**Navegar:** Use las teclas **↑** y **↓** para moverse entre filas. La fila seleccionada se resalta en azul.

**Abrir para editar:** Con una fila seleccionada, presione **Enter**; o haga doble clic en la fila.

## Crear un Cliente Nuevo

1. Presione **F3** o haga clic en el botón **➕ Nuevo**.
2. Se abre el formulario de alta.
3. Complete los campos y presione **F5** o el botón **Guardar**.

### Campos del Formulario

| Campo | Obligatorio | Descripción |
|---|---|---|
| Código | Sí | Número entero positivo. No se puede modificar después de creado. |
| Razón Social | Sí | Nombre legal o nombre completo. Mínimo 3 caracteres. |
| Nombre Fantasía | No | Nombre comercial (si difiere de la razón social). |
| CUIT | No | Clave Única de Identificación Tributaria. Formato: `XX-XXXXXXXX-X`. El sistema valida el dígito verificador. |
| Condición IVA | Sí | Régimen fiscal del cliente (ver tabla abajo). |
| Domicilio | No | Calle y número. |
| Localidad | No | Ciudad o localidad. |
| Código Postal | No | Código postal (hasta 8 caracteres). |
| Teléfono | No | Número de teléfono. |
| Email | No | Dirección de correo electrónico válida. |
| CBU | No | CBU bancario de 22 dígitos, usado para el matching de conciliación bancaria (#191). El sistema valida los dígitos verificadores. |
| Alias | No | Alias bancario (CVU/CBU), hasta 60 caracteres; también usado para el matching de conciliación bancaria (#191). |
| Activo | Sí | Desmarcar para dar de baja al cliente sin eliminarlo. |

### Condición IVA

| Valor | Descripción | Factura a emitir |
|---|---|---|
| **RI** | Responsable Inscripto | Factura A (IVA desglosado) |
| **Mono** | Monotributo | Factura B (IVA incluido) |
| **CF** | Consumidor Final | Factura B (IVA incluido) |
| **Exento** | Exento de IVA | Factura A o B sin IVA |

### Validación del CUIT

El sistema verifica automáticamente que el CUIT sea correcto. Si el dígito verificador no coincide, se mostrará el error **"CUIT inválido"**. Puede ingresar el CUIT con o sin guiones (`20123456786` o `20-12345678-6`).

### Consulta Padrón A4 AFIP (#192)

Al salir del campo CUIT (con Tab o haciendo clic en otro campo) con un dígito verificador válido, el formulario consulta automáticamente el Padrón A4 de AFIP (`GET /api/arca/padron/{cuit}`, con caché de 24 h por empresa) y muestra un mensaje de estado junto al campo:

| Estado | Significado |
|---|---|
| Consultando Padrón AFIP… | Consulta en curso. |
| CUIT verificado en Padrón AFIP. | Encontrado — se autocompletan **Razón Social**, **Condición IVA**, **Domicilio**, **Localidad** y **Código Postal** con los datos de AFIP. |
| CUIT no encontrado en Padrón AFIP. | El CUIT es válido pero no figura en los registros de AFIP; complete los campos manualmente. |
| Consulta a Padrón AFIP no disponible. | El módulo `billing.arca_cae` está deshabilitado o la empresa no tiene certificado AFIP configurado; complete los campos manualmente. |
| Padrón AFIP no respondió a tiempo. | Timeout; complete los campos manualmente. |
| CUIT inválido; no se realizó la consulta a Padrón AFIP. | El dígito verificador del CUIT no es válido. |

Si la razón social de AFIP (`razonSocial`) supera los 30 caracteres, **Razón Social** se autocompleta truncada a 30 caracteres y se muestra una advertencia para que la revise. Esta consulta **nunca bloquea el guardado del cliente** — siempre puede completar o corregir los campos manualmente y guardar. La homologación usa un padrón mock (`ws_sr_padron_a4`); la integración SOAP AFIP en producción queda fuera de alcance en esta entrega.

## Editar un Cliente

1. Seleccione el cliente en la tabla.
2. Presione **Enter** o haga doble clic.
3. Modifique los campos (el Código no es editable).
4. Presione **F5** o **Guardar**.

## Dar de Baja un Cliente

Edite el cliente y desmarque la casilla **Activo**. El cliente quedará inactivo pero sus facturas históricas se conservan.

## Importación masiva (CSV)

Quienes tengan permiso de gestión de clientes pueden cargar muchos registros desde un archivo **CSV en UTF-8**.

1. En el listado, abra **Importar CSV** (o el botón equivalente).
2. Descargue la **plantilla** desde el mismo diálogo: incluye la fila de cabeceras obligatorias y un ejemplo.
3. No modifique los nombres ni el orden de las columnas de la primera fila. Guarde el archivo como `.csv` (UTF-8).
4. Adjunte el archivo y confirme la importación. El sistema muestra cuántas filas se crearon y, si hubo errores de validación o duplicados, el detalle **por fila** (el número de fila cuenta desde la primera fila de datos; la fila 1 es el encabezado). Las reglas coinciden con la API REST de alta/edición; cada mensaje incluye la **ruta del campo** (p. ej. `rsocial: …`) cuando el servidor rechaza una fila.

**Política de duplicados:** si el **código** de cliente ya existe en la base de datos, o aparece repetido dentro del mismo archivo, esa fila se rechaza y no se inserta.

**Límites:** tamaño máximo de archivo y cantidad máxima de filas de datos están definidos en la API (véase documentación OpenAPI en `/api-docs`). Si el archivo supera el límite, recibirá un error.

## Cobros recientes

Al editar un cliente existente, el formulario muestra **cobros recientes** cargados desde `GET /api/cobros?clienteId=…`. Use el enlace para abrir **Cobros** filtrado por ese cliente o registrar un cobro nuevo.

## Score de cobranza

El formulario de cliente muestra el **score de cobranza** (0–100) cuando está disponible, con un tooltip que describe cómo cambia el score al registrar cobros contra facturas activas. Las reglas están documentadas en OpenAPI para `POST /api/cobros`.

## Portal B2B del cliente (#240)

Si el tenant tiene habilitado el módulo **Portal del cliente** (`clients.portal`), puede activar el portal en **Configuración → Empresa** (sección *Portal del cliente*): branding (logo, color, pie) y visibilidad de pedidos.

- **URL del portal (MVP):** `/portal/{slug-del-tenant}` en la misma app web (p. ej. `http://localhost:5173/portal/mi-empresa`).
- **Acceso:** el cliente ingresa su email registrado; recibe un magic link válido **15 minutos**; la sesión dura **8 horas**.
- **Secciones:** facturas (PDF y estado pendiente/vencida/pagada), cuenta corriente (saldo y PDF), pedidos (si está habilitado) y datos de contacto.
- **Aislamiento:** cada cliente solo ve sus propios comprobantes; el `clienteId` nunca se acepta como parámetro de confianza en la API.
- **Pago online (MercadoPago):** cuando el personal generó un link de pago activo (#175), el botón **Pagar online** del portal abre el checkout de Mercado Pago en una nueva pestaña.

Configure `SMTP_URL` (o variables SMTP del servidor) para que los magic links lleguen por correo en producción.

## Atajos de Teclado

| Tecla | Acción |
|---|---|
| F2 | Enfocar campo de búsqueda |
| F3 | Abrir formulario Nuevo cliente |
| F5 | Guardar formulario |
| ↑ / ↓ | Navegar filas de la tabla |
| Enter | Abrir cliente seleccionado |
| Esc | Cerrar formulario o diálogo de importación sin guardar |
