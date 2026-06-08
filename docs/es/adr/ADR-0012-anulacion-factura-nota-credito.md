# ADR-0012: Anulación de factura con nota de crédito obligatoria (`PUT /void`)

**Estado:** Aceptado  
**Fecha:** 2026-05-26  
**GitHub:** #146

---

## Contexto

El issue #146 menciona `POST /api/facturas/:id/anular`. El repositorio ya expone **`PUT /api/facturas/:id/void`** (OpenAPI, rutas, UI, tests). Una segunda ruta duplicaría comportamiento y rompería clientes existentes.

Para #146, la **anulación fiscal** implica: anular factura, revertir saldo del cliente, crear **`NotaCredito`** y auditar. Requiere módulo **`billing.credit_notes`**. Anulación administrativa sin NC queda **fuera de alcance**; si se necesita, será otra decisión y otro endpoint.

[`writeAuditEvent`](../../../server/audit.ts) ignora errores en el resto del sistema. En void, si falla la auditoría debe revertirse la transacción.

## Decisión

1. **API canónica:** extender solo **`PUT /api/facturas/:id/void`** (sin `POST /anular`, sin deprecar `PUT /void`).
2. **Módulo:** `requireModule('billing.credit_notes')` en `PUT /void` y en `GET /api/notas-credito*`.
3. **Permiso:** mantener **`sales.cancel`**.
4. **Transacción única:** `Factura.estado` → `N`, decremento de `Cliente.balance`, alta de `NotaCredito`, `AuditEvent` (`factura_void`). Fallo en cualquier paso → rollback.
5. **Respuesta:** `{ success, data: { factura, notaCredito, updatedCliente } }` — actualizar cliente API, OpenAPI, tests y UI en la misma fase.
6. **`NotaCredito.estadoCae` al crear:**
   - Si la factura origen tiene `estadoCae === 'issued'`: **`pending`** y luego CAE async con `billing.arca_cae` (mock #133).
   - Si no: **`not_required`** (sin intento AFIP; evita NC eternamente `pending`).
   - Valores: `pending` | `issued` | `failed` | `not_required`.
7. **Estado factura:** `A` / `N`; la NC es entidad aparte.
8. **Motivo:** mínimo 10 caracteres.

## Consecuencias

- **Positivo:** contrato único; NC, saldo y auditoría coherentes; CAE explícito según factura fiscal o no.
- **Negativo:** sin módulo `billing.credit_notes` no hay void por API.
- **Fuera de alcance:** WSFE NC productivo completo; refactor global de auditoría.

## Referencias

- [docs/api/openapi.yaml](../../api/openapi.yaml)
- Issues #146, #133
