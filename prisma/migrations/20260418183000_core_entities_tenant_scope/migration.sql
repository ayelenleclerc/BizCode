-- Multi-tenant scope for core ERP entities (Issue #83).
-- Backfill: assign all existing rows to the first Tenant by id (typically `platform` from seed).
--
-- Fresh databases (e.g. CI `prisma migrate deploy` without seed) have zero Tenant rows.
-- Without a row, MIN(id) is NULL and NOT NULL on ERP tables fails. Insert a bootstrap tenant.

INSERT INTO "Tenant" ("name", "slug", "active", "createdAt", "updatedAt")
SELECT 'Bootstrap', 'bootstrap-default-tenant', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Tenant" LIMIT 1);

ALTER TABLE "Cliente" ADD COLUMN "tenantId" INTEGER;
ALTER TABLE "Rubro" ADD COLUMN "tenantId" INTEGER;
ALTER TABLE "Articulo" ADD COLUMN "tenantId" INTEGER;
ALTER TABLE "Proveedor" ADD COLUMN "tenantId" INTEGER;
ALTER TABLE "Factura" ADD COLUMN "tenantId" INTEGER;

UPDATE "Cliente" SET "tenantId" = (SELECT MIN("id") FROM "Tenant");
UPDATE "Rubro" SET "tenantId" = (SELECT MIN("id") FROM "Tenant");
UPDATE "Articulo" SET "tenantId" = (SELECT MIN("id") FROM "Tenant");
UPDATE "Proveedor" SET "tenantId" = (SELECT MIN("id") FROM "Tenant");
UPDATE "Factura" SET "tenantId" = (SELECT MIN("id") FROM "Tenant");

ALTER TABLE "Cliente" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Rubro" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Articulo" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Proveedor" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Factura" ALTER COLUMN "tenantId" SET NOT NULL;

DROP INDEX IF EXISTS "Cliente_codigo_key";
DROP INDEX IF EXISTS "Rubro_codigo_key";
DROP INDEX IF EXISTS "Articulo_codigo_key";
DROP INDEX IF EXISTS "Proveedor_codigo_key";
DROP INDEX IF EXISTS "Factura_tipo_prefijo_numero_key";

ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Rubro" ADD CONSTRAINT "Rubro_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Articulo" ADD CONSTRAINT "Articulo_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Proveedor" ADD CONSTRAINT "Proveedor_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Cliente_tenantId_codigo_key" ON "Cliente"("tenantId", "codigo");
CREATE UNIQUE INDEX "Rubro_tenantId_codigo_key" ON "Rubro"("tenantId", "codigo");
CREATE UNIQUE INDEX "Articulo_tenantId_codigo_key" ON "Articulo"("tenantId", "codigo");
CREATE UNIQUE INDEX "Proveedor_tenantId_codigo_key" ON "Proveedor"("tenantId", "codigo");
CREATE UNIQUE INDEX "Factura_tenantId_tipo_prefijo_numero_key" ON "Factura"("tenantId", "tipo", "prefijo", "numero");

CREATE INDEX "Cliente_tenantId_idx" ON "Cliente"("tenantId");
CREATE INDEX "Rubro_tenantId_idx" ON "Rubro"("tenantId");
CREATE INDEX "Articulo_tenantId_idx" ON "Articulo"("tenantId");
CREATE INDEX "Proveedor_tenantId_idx" ON "Proveedor"("tenantId");
CREATE INDEX "Factura_tenantId_idx" ON "Factura"("tenantId");
