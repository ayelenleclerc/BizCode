-- AlterTable
ALTER TABLE "ComprobanteCompra" ADD COLUMN "vencimiento" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AlertaProveedorConfig" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "diasPrevioAviso" INTEGER NOT NULL DEFAULT 3,
    "diasCritico" INTEGER NOT NULL DEFAULT 7,
    "notifEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifInApp" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertaProveedorConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertaProveedorLog" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "comprobanteCompraId" INTEGER NOT NULL,
    "tipo" VARCHAR(30) NOT NULL,
    "enviadoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertaProveedorLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlertaProveedorConfig_tenantId_key" ON "AlertaProveedorConfig"("tenantId");

-- CreateIndex
CREATE INDEX "AlertaProveedorLog_tenantId_comprobanteCompraId_tipo_enviadoAt_idx" ON "AlertaProveedorLog"("tenantId", "comprobanteCompraId", "tipo", "enviadoAt");

-- AddForeignKey
ALTER TABLE "AlertaProveedorConfig" ADD CONSTRAINT "AlertaProveedorConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertaProveedorLog" ADD CONSTRAINT "AlertaProveedorLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertaProveedorLog" ADD CONSTRAINT "AlertaProveedorLog_comprobanteCompraId_fkey" FOREIGN KEY ("comprobanteCompraId") REFERENCES "ComprobanteCompra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
