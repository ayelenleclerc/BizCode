-- Mexico CFDI mock PAC residual (#210): SAT catalog, articulo.claveProdServ, FiscalDocument cancel fields.

ALTER TABLE "Articulo" ADD COLUMN IF NOT EXISTS "claveProdServ" VARCHAR(8);

ALTER TABLE "FiscalDocument" ADD COLUMN IF NOT EXISTS "cancelReasonCode" VARCHAR(2);
ALTER TABLE "FiscalDocument" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "SatCatalogEntry" (
    "id" SERIAL NOT NULL,
    "catalog" VARCHAR(32) NOT NULL,
    "code" VARCHAR(16) NOT NULL,
    "description" VARCHAR(512) NOT NULL,
    "sourceLabel" VARCHAR(64) NOT NULL DEFAULT 'sat-cfdi-4.0-curated',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SatCatalogEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SatCatalogEntry_catalog_code_key" ON "SatCatalogEntry"("catalog", "code");
CREATE INDEX IF NOT EXISTS "SatCatalogEntry_catalog_description_idx" ON "SatCatalogEntry"("catalog", "description");
