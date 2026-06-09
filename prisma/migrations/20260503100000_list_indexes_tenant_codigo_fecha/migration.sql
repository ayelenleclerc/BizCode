-- Optimize tenant-scoped listings ordered by codigo or by fecha (issue #89).

CREATE INDEX IF NOT EXISTS "Cliente_tenantId_codigo_idx" ON "Cliente" ("tenantId", "codigo");
CREATE INDEX IF NOT EXISTS "Articulo_tenantId_codigo_idx" ON "Articulo" ("tenantId", "codigo");
CREATE INDEX IF NOT EXISTS "Rubro_tenantId_codigo_idx" ON "Rubro" ("tenantId", "codigo");
CREATE INDEX IF NOT EXISTS "Proveedor_tenantId_codigo_idx" ON "Proveedor" ("tenantId", "codigo");
CREATE INDEX IF NOT EXISTS "Factura_tenantId_fecha_idx" ON "Factura" ("tenantId", "fecha");
