-- AlterTable TenantConfig: default commission accrual mode (#237)
ALTER TABLE "TenantConfig" ADD COLUMN "comisionesModoDevengo" VARCHAR(40) NOT NULL DEFAULT 'porcentaje_cobrado';

-- CreateTable
CREATE TABLE "ConfigComision" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "vendedorId" INTEGER NOT NULL,
    "tipo" VARCHAR(40) NOT NULL,
    "alicuota" DECIMAL(14,4) NOT NULL,
    "vigenciaDesde" TIMESTAMP(3) NOT NULL,
    "vigenciaHasta" TIMESTAMP(3),
    "articuloCategoriaId" INTEGER,
    "clienteId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigComision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiquidacionComision" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "vendedorId" INTEGER NOT NULL,
    "periodo" VARCHAR(7) NOT NULL,
    "totalVentas" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalComision" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'borrador',
    "aprobadoPorId" INTEGER,
    "pagadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiquidacionComision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiquidacionComisionDetalle" (
    "id" SERIAL NOT NULL,
    "liquidacionId" INTEGER NOT NULL,
    "facturaId" INTEGER,
    "reciboCobroId" INTEGER,
    "imputacionId" INTEGER,
    "montoBase" DECIMAL(14,2) NOT NULL,
    "alicuota" DECIMAL(14,4) NOT NULL,
    "comision" DECIMAL(14,2) NOT NULL,
    "concepto" VARCHAR(200) NOT NULL,

    CONSTRAINT "LiquidacionComisionDetalle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConfigComision_tenantId_vendedorId_idx" ON "ConfigComision"("tenantId", "vendedorId");

-- CreateIndex
CREATE INDEX "ConfigComision_tenantId_vendedorId_vigenciaDesde_idx" ON "ConfigComision"("tenantId", "vendedorId", "vigenciaDesde");

-- CreateIndex
CREATE INDEX "ConfigComision_tenantId_clienteId_idx" ON "ConfigComision"("tenantId", "clienteId");

-- CreateIndex
CREATE INDEX "ConfigComision_tenantId_articuloCategoriaId_idx" ON "ConfigComision"("tenantId", "articuloCategoriaId");

-- CreateIndex
CREATE INDEX "LiquidacionComision_tenantId_periodo_idx" ON "LiquidacionComision"("tenantId", "periodo");

-- CreateIndex
CREATE INDEX "LiquidacionComision_tenantId_estado_idx" ON "LiquidacionComision"("tenantId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "LiquidacionComision_tenantId_vendedorId_periodo_key" ON "LiquidacionComision"("tenantId", "vendedorId", "periodo");

-- CreateIndex
CREATE INDEX "LiquidacionComisionDetalle_liquidacionId_idx" ON "LiquidacionComisionDetalle"("liquidacionId");

-- CreateIndex
CREATE INDEX "LiquidacionComisionDetalle_facturaId_idx" ON "LiquidacionComisionDetalle"("facturaId");

-- CreateIndex
CREATE INDEX "LiquidacionComisionDetalle_reciboCobroId_idx" ON "LiquidacionComisionDetalle"("reciboCobroId");

-- CreateIndex
CREATE INDEX "LiquidacionComisionDetalle_imputacionId_idx" ON "LiquidacionComisionDetalle"("imputacionId");

-- AddForeignKey
ALTER TABLE "ConfigComision" ADD CONSTRAINT "ConfigComision_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigComision" ADD CONSTRAINT "ConfigComision_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigComision" ADD CONSTRAINT "ConfigComision_articuloCategoriaId_fkey" FOREIGN KEY ("articuloCategoriaId") REFERENCES "CategoriaArticulo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigComision" ADD CONSTRAINT "ConfigComision_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiquidacionComision" ADD CONSTRAINT "LiquidacionComision_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiquidacionComision" ADD CONSTRAINT "LiquidacionComision_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiquidacionComision" ADD CONSTRAINT "LiquidacionComision_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiquidacionComisionDetalle" ADD CONSTRAINT "LiquidacionComisionDetalle_liquidacionId_fkey" FOREIGN KEY ("liquidacionId") REFERENCES "LiquidacionComision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiquidacionComisionDetalle" ADD CONSTRAINT "LiquidacionComisionDetalle_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiquidacionComisionDetalle" ADD CONSTRAINT "LiquidacionComisionDetalle_reciboCobroId_fkey" FOREIGN KEY ("reciboCobroId") REFERENCES "ReciboCobro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiquidacionComisionDetalle" ADD CONSTRAINT "LiquidacionComisionDetalle_imputacionId_fkey" FOREIGN KEY ("imputacionId") REFERENCES "ReciboCobroImputacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
