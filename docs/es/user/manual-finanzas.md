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

Requiere **`settings.business.manage`**. Los links de pago por factura y el pago online del portal no están disponibles hasta el issue #175.

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

**Presentaciones SICORE/SIFERE (#242):** en **Finanzas → Presentaciones impositivas** (`finance.retenciones`, `reports.financial.read`): elegí período y formato (SICORE nacional o SIFERE IIBB), vista previa con totales por régimen y advertencias de CUIT, descarga TXT (`POST /api/fiscal/presentaciones` + `GET .../{id}/archivo`), historial y marca «presentado» tras subir a AFIP/COMARB. APIs: `GET /api/fiscal/presentaciones/preview?formato=sicore|sifere&periodo=YYYY-MM`, `POST/GET /api/fiscal/presentaciones`, `PATCH /api/fiscal/presentaciones/{id}/presentado`. Export directo legacy: `GET /api/fiscal/retenciones/export`. Validá los archivos en homologación oficial manualmente.

La condición IVA de clientes/proveedores usa `condIva` del maestro; consulta Padrón AFIP (#192) no implementada en esta entrega.

**Otros idiomas:** [English](../../en/user/manual-finance.md) · [Português](../../pt-br/user/manual-financas.md)
