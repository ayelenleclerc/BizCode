-- Allow multiple credit notes per invoice for partial Mercado Pago refunds (#344).
DROP INDEX IF EXISTS "NotaCredito_tenantId_facturaOrigenId_key";
