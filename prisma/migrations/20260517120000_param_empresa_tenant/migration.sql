-- ParamEmpresa: tenant-scoped company settings (GitHub #127).
-- Legacy rows without tenantId are discarded; the table had no API usage before this migration.

DROP TABLE IF EXISTS "ParamEmpresa";

CREATE TABLE "ParamEmpresa" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "nombre" VARCHAR(40) NOT NULL,
    "cuit" VARCHAR(14) NOT NULL,
    "domicilio" VARCHAR(40),
    "puntoVenta" INTEGER NOT NULL DEFAULT 1,
    "tipoFactura" VARCHAR(1) NOT NULL DEFAULT 'B',
    "logoUrl" VARCHAR(255),

    CONSTRAINT "ParamEmpresa_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ParamEmpresa_tenantId_key" ON "ParamEmpresa"("tenantId");

ALTER TABLE "ParamEmpresa" ADD CONSTRAINT "ParamEmpresa_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
