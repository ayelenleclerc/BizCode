# Manual de Usuario: Finanzas

## Acceso

Haga clic en **Finanzas** en el menú lateral izquierdo.

Requiere el permiso **`reports.financial.read`**. Sin él, la página muestra un mensaje de acceso denegado.

## Antigüedad de saldos (CxC)

Al cargar, la página consulta **`GET /api/reportes/aging`** y muestra buckets (etiquetas, cantidad de facturas, totales). Puede ordenar por columnas cuando la UI lo implemente.

## Cuenta corriente

1. Ingrese un **id de cliente** (entero positivo).
2. Ejecute la acción para cargar la cuenta corriente (`GET /api/reportes/cuenta-corriente/:clienteId`).
3. Revise las líneas con fecha, tipo, referencia, débito, crédito y saldo acumulado.

Si el cliente no existe, la API devuelve 404.

## Facturas vencidas y recordatorios

La misma página **Finanzas** incluye una sección de facturas vencidas (`GET /api/cobranzas/vencidas`):

1. Opcionalmente filtre por **días mínimos de mora**.
2. Revise la tabla (cliente, total, fecha, días de mora).
3. Use **Enviar recordatorio** en una fila para disparar `POST /api/cobranzas/recordatorios` (permiso `reports.financial.read`). No se envía más de un recordatorio por factura el mismo día.

La configuración del job automático (días de gracia, zona horaria IANA, horario comercial) está en **Configuración → Empresa**. El job operativo `npm run cobranzas:recordatorios` recorre todos los tenants con parámetros de empresa y envía a las **08:00 hora local** dentro de la ventana configurada (véase [ciclo CI/CD](../quality/ciclo-ci-cd.md)).

## Referencia API

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — rutas `/api/reportes/aging` y `/api/reportes/cuenta-corriente/{clienteId}`.

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

Configure regímenes y flags de agente en **Configuración → Empresa → Retenciones y percepciones** (`settings.fiscal.manage`). APIs: `GET/POST/PUT /api/fiscal/regimenes`, `GET/PUT /api/fiscal/config-retenciones`, `GET /api/fiscal/retenciones` (historial), `GET /api/fiscal/retenciones/preview` (sugerencias en pago a proveedor #276; cobros/factura en #229). La condición IVA de clientes/proveedores usa `condIva` del maestro; consulta Padrón AFIP (#192) no implementada en esta entrega.

**Otros idiomas:** [English](../../en/user/manual-finance.md) · [Português](../../pt-br/user/manual-financas.md)
