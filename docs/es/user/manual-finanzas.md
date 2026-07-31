# Manual de Usuario: Finanzas

## Acceso

Haga clic en **Finanzas** en el menú lateral izquierdo.

Requiere el permiso **`reports.financial.read`**. Sin él, la página muestra un mensaje de acceso denegado.

## Antigüedad de saldos (CxC)

Al cargar, la página consulta **`GET /api/reportes/aging`** y muestra buckets (etiquetas, cantidad de facturas, totales). Puede ordenar por columnas cuando la UI lo implemente.

## Cuenta corriente

### Ficha de cliente (`finance.ledger`, #232)

Con el módulo **`finance.ledger`** habilitado, la ficha de cada cliente incluye la pestaña **Cuenta corriente**:

- Saldo actual, límite de crédito y gráfico de evolución.
- Tabla de movimientos paginada (factura, nota de crédito, cobro, retención, cheque rechazado, ajuste).
- Antigüedad de saldos por buckets (`0-30`, `31-60`, `61-90`, `+90` días).
- Ajuste manual auditado (`POST /api/clientes/{id}/cuenta-corriente/ajuste`, permiso `sales.create`).
- Descarga de estado de cuenta PDF y envío por email (`GET` / `POST .../estado-de-cuenta/...`).

API canónica: `GET /api/clientes/{id}/cuenta-corriente`, `.../saldo`, `.../antiguedad`.

Los movimientos se registran automáticamente al emitir facturas, anular con nota de crédito, registrar cobros (monto bruto; las retenciones no generan línea aparte en el ledger) y rechazar cheques vinculados a cobros.

### Consulta rápida en Finanzas (compatibilidad)

1. Ingrese un **id de cliente** (entero positivo).
2. Ejecute la acción para cargar la cuenta corriente (`GET /api/reportes/cuenta-corriente/:clienteId` — delega al ledger y mantiene formato débito/crédito legacy).
3. Revise las líneas con fecha, tipo, referencia, débito, crédito y saldo acumulado.

Si el cliente no existe, la API devuelve 404.

## Facturas vencidas y recordatorios

La misma página **Finanzas** incluye una sección de facturas vencidas (`GET /api/cobranzas/vencidas`):

1. Opcionalmente filtre por **días mínimos de mora**.
2. Revise la tabla (cliente, total, fecha, días de mora).
3. Use **Enviar recordatorio** en una fila para disparar `POST /api/cobranzas/recordatorios` (permiso `reports.financial.read`). No se envía más de un recordatorio por factura el mismo día.

La configuración del job automático (días de gracia, zona horaria IANA, horario comercial) está en **Configuración → Empresa**. El job operativo `npm run cobranzas:recordatorios` recorre todos los tenants con parámetros de empresa y envía a las **08:00 hora local** dentro de la ventana configurada (véase [ciclo CI/CD](../quality/ciclo-ci-cd.md)).

## Credenciales Mercado Pago (#174)

Si el tenant tiene habilitada la integración **`mercadopago`** (config del superadmin), configure las credenciales en **Configuración → Empresa** (sección *MercadoPago*):

- **Access Token**, **Public Key** y **Webhook Secret** opcional (secretos cifrados en reposo; no se muestran tras guardar).
- Interruptores **Modo sandbox** e **Integración activa**.
- **Verificar credenciales** llama a `POST /api/configuracion/mercadopago/test` y muestra el nombre de la cuenta MP.

Requiere **`settings.business.manage`**.

## Links de pago Mercado Pago (#175)

Con Mercado Pago configurado (#174) y activo, el personal puede generar un **link de pago** desde el detalle de la factura (**Cobrar con MercadoPago**):

1. Abrir una factura activa con saldo pendiente.
2. Generar el link (`POST /api/facturas/{id}/mp/preference`) — una preference activa por factura (72 horas).
3. Copiar el link o compartir por WhatsApp / email (teléfono y email del cliente).

Los clientes del portal ven **Pagar online** cuando existe un link activo para su factura.

Configure **`API_PUBLIC_URL`** en producción para que Mercado Pago alcance la URL de webhook registrada en cada preference.

## Webhook de pago Mercado Pago (#176)

Mercado Pago envía notificaciones a `POST /api/webhooks/mercadopago` (público, sin sesión). Requisitos:

1. Configurar **`webhookSecret`** en **Configuración → Empresa** (mismo secreto que en la aplicación de Mercado Pago).
2. Definir **`API_PUBLIC_URL`** con la URL pública del API.
3. Cuando un cliente paga un link de factura (#175), BizCode valida la firma, consulta el pago en Mercado Pago y, si está **approved**, crea un **recibo de cobro** (`ReciboCobro`) con forma `mercadopago` imputado a la factura; `Factura.mpEstado` pasa a `approved`.
4. Notificaciones duplicadas del mismo `mpPaymentId` se ignoran (idempotente).
5. Los managers reciben notificación in-app al recibir o fallar un pago.

## QR de cobro presencial Mercado Pago (#177)

Para cobrar en mostrador (web) con Mercado Pago configurado (#174) y activo:

1. Abrir una factura activa con saldo pendiente.
2. Elegir **Cobrar con QR** — genera un QR dinámico instore (`POST /api/facturas/{id}/mp/qr`, TTL 10 minutos).
3. Mostrar el QR para que el cliente escanee con la app de Mercado Pago; la UI consulta `GET /api/facturas/{id}/mp` cada 3 segundos hasta `approved`.
4. La confirmación usa el mismo webhook que #176 (`external_reference` = `{tenantId}:{facturaId}`).
5. Opcional en **Configuración → Empresa**: **ID de POS** (`externalPosId`) y **payload QR estático** (`staticQrData`); staff con `settings.business.manage` puede leer el QR estático vía `GET /api/configuracion/mercadopago/qr-estatico`.

La extensión en App Repartidor queda para el issue #162 (cobros en entrega).

## Reconciliación de pagos Mercado Pago (#178)

Algunos pagos llegan a Mercado Pago sin preference ni orden QR vinculada (transferencia directa, QR estático). BizCode los detecta y los reconcilia con facturas abiertas de forma automática o asistida.

1. **Job diario** (`npm run mercadopago:reconciliacion`, cron recomendado `0 * * * *` para las 02:00 hora local por tenant): busca pagos `approved` de los últimos 2 días; omite pagos ya registrados en `MercadoPagoProcessedPayment`.
2. **Auto-match:** si el CUIT del pagador coincide con un cliente y hay una sola factura abierta con el mismo saldo pendiente exacto → crea `ReciboCobro` y marca la entrada `reconciled`. Montos parciales o matches ambiguos quedan en cola manual.
3. **Cola manual:** **Finanzas → Reconciliación Mercado Pago** (`/finanzas/reconciliacion-mp`, integración `mercadopago`, `reports.financial.read`): lista pagos pendientes; cargá facturas abiertas por ID de cliente; **Reconciliar** (`POST /api/mercadopago/reconciliar`) o **Ignorar** (`POST /api/mercadopago/ignorar`).
4. **Job bajo demanda:** el staff puede ejecutar `POST /api/mercadopago/reconciliacion/run` desde la UI.

## Reembolsos y contracargos Mercado Pago (#179, #344)

**Reembolso total y parcial** cuando `mpEstado` es **approved** y existe recibo MP vinculado.

1. **Reembolso:** En **Facturación → detalle de factura**, usuarios con **`sales.cancel`** y módulo **`billing.credit_notes`** ven **Reembolsar pago MP**. Motivo (mín. 10 caracteres) y opcionalmente **monto parcial** (por defecto el saldo reembolsable restante). `POST /api/facturas/{id}/mp/reembolso`. **Parcial:** nota de crédito parcial (#344) + reversión parcial del recibo; la factura sigue activa. **Total** (saldo restante): anula recibo, anula factura con NC (#146, monto NC restante si hubo parciales previos), `mpEstado: refunded`. Montos mayores al saldo reembolsable: `422 exceeds_refundable_balance`.
2. **Estado de reembolsos:** `GET /api/facturas/{id}/mp/reembolso` devuelve `refundableBalance`, `originalPaymentAmount` e historial; el diálogo lista cada reembolso (`iniciado` → `procesando` → `completado` / `fallido`).
3. **Contracargos:** el webhook `type: chargebacks` crea `MercadoPagoChargeback` (`pendiente`) y notifica a managers. **Sin void ni NC automática** — el staff resuelve manualmente. Cola: **Finanzas → Contracargos Mercado Pago** (`/finanzas/contracargos-mp`, `reports.financial.read`); marcar **Resuelto** o **Ignorar** con `PATCH /api/mercadopago/contracargos/{id}`.

## Referencia API

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — rutas `/api/reportes/aging`, `/api/reportes/cuenta-corriente/{clienteId}` y `/api/clientes/{id}/cuenta-corriente/*`.

## Notas de crédito (`billing.credit_notes`)

Con el módulo **`billing.credit_notes`** habilitado, la página añade la sección **Notas de crédito**: filtre por fechas **desde** / **hasta** (sobre `createdAt` de la nota) y opcionalmente por **ID de cliente** (cliente de la factura origen). Los datos provienen de `GET /api/notas-credito` (requiere **`reports.financial.read`** u **`reports.operational.read`**; esta pantalla solo es accesible con permisos de reportes financieros). Véase [ADR-0012](../adr/ADR-0012-anulacion-factura-nota-credito.md) y el manual de facturación para anular facturas.

## Libro IVA Ventas — Fase 1 (`finance.ledger`, #147)

Con el módulo **`finance.ledger`** habilitado, aparece la sección **Contabilidad — Libro IVA Ventas**:

1. Seleccione **período** (mes).
2. Revise la **vista previa** (cantidad de registros CBTV/ALICUOTAS, totales por alícuota). La validación con herramienta oficial ARCA puede estar pendiente ([ADR-0013](../adr/ADR-0013-libro-iva-ventas-fase1.md)).
3. **Descargar ARCA (ZIP)** — `format=txt` → `CBTV.txt` + `ALICUOTAS.txt`.
4. **Descargar Excel** — solo revisión interna.

## Libro IVA Compras (`finance.ledger`, #306)

Con **`finance.ledger`**, debajo de ventas aparece **Contabilidad — Libro IVA Compras**:

1. Use el formulario **Alta de comprobante de compra** (proveedor, fecha, tipo A/B/C, punto de venta, número, netos, IVA, total; CAE opcional). La API `POST /api/comprobantes-compra` sigue disponible para integraciones.
2. **Importar documento de compra** (#277): suba PDF o imagen (hasta 20 archivos por lote), incluido **Tomar foto** en móvil (`capture="environment"`). Tiers locales: QR AFIP/ARCA (Tier 1), texto PDF + plantillas YAML (Tier 2, Argentina/Brasil/Uruguay incluidas), OCR (`spa+eng+por`) + plantillas (Tier 3), Ollama opcional con `OLLAMA_URL` (Tier 4, puede devolver ítems). El preview muestra cabecera y **tabla de ítems** con indicadores de confianza; mapee cada línea con **Buscar artículo**, **Crear artículo** inline o **Ignorar línea** (sugerencias del catálogo del proveedor cuando existan). Si el CUIT/CNPJ/RUT no coincide, use **Crear proveedor** inline. **Duplicados:** `GET /api/documentos-compra/verificar-duplicado` alerta antes de confirmar si el mismo proveedor ya tiene un comprobante activo con igual tipo/prefijo/número; la confirmación se bloquea hasta resolverlo. Los originales se guardan en filesystem local (`DOCUMENTOS_COMPRA_STORAGE_PATH`) — despliegue desktop-first según [PROD-VISION-001](../quality/vision-producto-y-despliegue.md); S3 no aplica en esta entrega. **Stock en remitos** no se actualiza automáticamente; los ítems quedan como snapshot en `datosExtraidos` (issue de seguimiento). Revise la cola y confirme para crear `ComprobanteCompra`. APIs: `POST /api/documentos-compra/procesar`, `POST /api/documentos-compra/procesar-lote`, `GET /api/documentos-compra/cola`, `GET /api/documentos-compra/verificar-duplicado`, `POST /api/documentos-compra/confirmar`. Plantillas YAML custom: sección **Plantillas de extracción** o `GET`/`POST /api/documentos-compra/templates` (`settings.fiscal.manage`).
3. Seleccione **período** y revise la **vista previa** (CBTU / ALICUOTAS). Véase [ADR-0014](../adr/ADR-0014-libro-iva-compras.md).
3. **Descargar ARCA (ZIP)** — `CBTU.txt` + `ALICUOTAS.txt`.
4. **Descargar Excel** — solo revisión interna.

Las órdenes de compra (`OrdenCompra`) **no** sustituyen comprobantes fiscales de proveedor.

## Retenciones y percepciones (`finance.retenciones`, #228)

Configure regímenes y flags de agente en **Configuración → Empresa → Retenciones y percepciones** (`settings.fiscal.manage`). APIs: `GET/POST/PUT /api/fiscal/regimenes`, `GET/PUT /api/fiscal/config-retenciones`, `GET /api/fiscal/retenciones` (historial), `GET /api/fiscal/retenciones/preview` (`entidadTipo=proveedor` #276; `entidadTipo=cliente` con `contexto=factura` en `POST /api/facturas` o `contexto=cobro` en `POST /api/cobros` #229); `GET /api/cobros/{id}/retenciones`. **Remitos (#230):** módulo `fiscal.remito`; `GET/POST /api/remitos`, ciclo emitir/entregar/anular, `GET /api/remitos/{id}/pdf`; creación desde `POST /api/pedidos/{id}/remito` o `POST /api/facturas/{id}/remito` (documental; stock en factura). e-Remito AFIP no implementado.

**Cheques (#231):** módulo `fiscal.cheques`; cartera en **Finanzas** (`GET /api/cheques`, `GET /api/cheques/resumen`, transiciones depositar/endosar/cobrar/rechazar/anular). Alta al registrar cobro (`chequeNuevo` en `POST /api/cobros`) o endoso al pagar proveedor (`chequeId` en `POST /api/proveedores/{id}/pagos` con método `cheque`/`echeq`). Alertas `cheque_due_soon` (≤3 días) vía `POST /api/cheques/alertas/run`; rechazo notifica `cheque_rechazado`. Sin conciliación bancaria ni estado ECHEQ automático en esta versión.

## Extractos bancarios (#190)

Módulo `finance.bank_reconcile`. En **Finanzas** podés:

1. Registrar cuentas (`POST /api/bancos/cuentas`) con CBU de 22 dígitos.
2. Importar extractos CSV, OFX o MT940 (`POST /api/bancos/cuentas/{id}/importar`).
3. Configurar mapeos CSV por código de banco (`GET/POST/PATCH /api/bancos/csv-mappings`) — seeds para Galicia, Santander, BBVA, Macro y Nación; se pueden agregar bancos nuevos sin redeploy.
4. Listar movimientos importados (`GET /api/bancos/cuentas/{id}/movimientos`).

La deduplicación usa fecha+importe+tipo+referencia+descripción.

## Conciliación bancaria y matching (#191)

Módulo `finance.bank_reconcile`, `reports.financial.read`; las acciones de escritura (ejecutar matching, confirmar/ignorar, asignación manual, bloquear/desbloquear) requieren rol owner/manager/super_admin. En **Finanzas → Conciliación bancaria** (`/finanzas/conciliacion-bancaria`):

1. **Seleccioná cuenta y rango de fechas** (`desde`/`hasta`) para cargar los movimientos y un resumen de estados conciliados/sugeridos/sin conciliar (`GET /api/bancos/cuentas/{id}/conciliacion`).
2. **Ejecutar matching** (`POST .../conciliacion/run`): el motor puro `matchEngine` puntúa cada movimiento sin conciliar o sugerido contra candidatos abiertos de `ReciboCobroForma` (formas transferencia/cheque) y `Cobro`, por monto, una ventana de tolerancia de fecha y — cuando está disponible — el `cbu`/`alias` del cliente (configurable en el formulario de **Clientes**). Los movimientos quedan `matched_auto` cuando hay un único candidato de alta confianza, `suggested` cuando hay varios candidatos o de menor confianza, o permanecen `unmatched`.
3. **Revisá la tabla:** cada fila muestra el movimiento del extracto, un estado con color (verde = conciliado automático, amarillo = sugerido, rojo = sin conciliar) y acciones:
   - **Confirmar sugerencia** (`POST /api/bancos/movimientos/{movId}/sugerencia/confirmar`) acepta la sugerencia mejor puntuada como match manual.
   - **Asignación manual** (`POST .../conciliar` con `{ tipo: 'recibo_forma' | 'cobro', id }`) vincula el movimiento a una forma de recibo o cobro específico por ID.
   - **Ignorar** (`POST .../ignorar`) marca el movimiento como revisado sin match (por ejemplo, transferencias entre cuentas propias).
   - **Gasto bancario** (`POST .../gasto-bancario`) marca un movimiento débito como gasto/comisión bancaria, excluyéndolo de la conciliación pendiente.
4. **Exportá** la vista actual a Excel (`GET .../conciliacion/export.xlsx`).
5. **Bloqueá/desbloqueá un período** (`YYYY-MM`) con `POST`/`DELETE /api/bancos/cuentas/{id}/periodos/{periodo}/lock` para impedir nuevas ediciones de conciliación una vez cerrado el mes.

El `cbu`/`alias` del cliente (opcionales, editables en el formulario de cliente) mejoran la confianza del matching automático de transferencias; ambos campos se borran al anonimizar al cliente (#195).

**Presentaciones SICORE/SIFERE (#242):** en **Finanzas → Presentaciones impositivas** (`finance.retenciones`, `reports.financial.read`): elegí período y formato (SICORE nacional o SIFERE IIBB), vista previa con totales por régimen y advertencias de CUIT, descarga TXT (`POST /api/fiscal/presentaciones` + `GET .../{id}/archivo`), historial y marca «presentado» tras subir a AFIP/COMARB. APIs: `GET /api/fiscal/presentaciones/preview?formato=sicore|sifere&periodo=YYYY-MM`, `POST/GET /api/fiscal/presentaciones`, `PATCH /api/fiscal/presentaciones/{id}/presentado`. Export directo legacy: `GET /api/fiscal/retenciones/export`. Validá los archivos en homologación oficial manualmente.

La condición IVA de clientes/proveedores usa `condIva` del maestro; consulta Padrón AFIP (#192) no implementada en esta entrega.

**Otros idiomas:** [English](../../en/user/manual-finance.md) · [Português](../../pt-br/user/manual-financas.md)
