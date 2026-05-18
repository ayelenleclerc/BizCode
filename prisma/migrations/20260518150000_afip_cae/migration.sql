-- AlterTable
ALTER TABLE "Factura" ADD COLUMN "cae" VARCHAR(20),
ADD COLUMN "caeVto" TIMESTAMP(3),
ADD COLUMN "estadoCae" VARCHAR(20) NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE "TenantFiscalConfig" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "cuit" VARCHAR(14) NOT NULL,
    "certEncrypted" TEXT NOT NULL,
    "keyEncrypted" TEXT NOT NULL,
    "ambiente" VARCHAR(20) NOT NULL DEFAULT 'homologacion',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantFiscalConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantFiscalConfig_tenantId_key" ON "TenantFiscalConfig"("tenantId");

-- AddForeignKey
ALTER TABLE "TenantFiscalConfig" ADD CONSTRAINT "TenantFiscalConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
