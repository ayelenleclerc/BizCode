-- Tenant-scoped FK filters for frequent joins and lookups (issue #89).

CREATE INDEX IF NOT EXISTS "Articulo_tenantId_rubroId_idx" ON "Articulo" ("tenantId", "rubroId");
CREATE INDEX IF NOT EXISTS "Factura_tenantId_clienteId_idx" ON "Factura" ("tenantId", "clienteId");
