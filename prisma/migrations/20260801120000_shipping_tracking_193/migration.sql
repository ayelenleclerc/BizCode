-- AlterTable OrdenEntrega — carrier tracking fields (#193)
ALTER TABLE "OrdenEntrega" ADD COLUMN "transportista" VARCHAR(40),
ADD COLUMN "nroSeguimiento" VARCHAR(80),
ADD COLUMN "estadoEnvio" VARCHAR(20),
ADD COLUMN "ultimoEventoAt" TIMESTAMP(3),
ADD COLUMN "trackingEventos" JSONB;

CREATE INDEX "OrdenEntrega_tenantId_estadoEnvio_idx" ON "OrdenEntrega"("tenantId", "estadoEnvio");

-- CreateTable ShippingCarrierConfig (#193)
CREATE TABLE "ShippingCarrierConfig" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "carrier" VARCHAR(40) NOT NULL,
    "usernameEncrypted" TEXT NOT NULL,
    "passwordEncrypted" TEXT NOT NULL,
    "usernameLast4" VARCHAR(4) NOT NULL,
    "sandboxMode" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingCarrierConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShippingCarrierConfig_tenantId_carrier_key" ON "ShippingCarrierConfig"("tenantId", "carrier");
CREATE INDEX "ShippingCarrierConfig_tenantId_activo_idx" ON "ShippingCarrierConfig"("tenantId", "activo");

ALTER TABLE "ShippingCarrierConfig" ADD CONSTRAINT "ShippingCarrierConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
