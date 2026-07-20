-- AlterTable
ALTER TABLE "Articulo" ADD COLUMN "mesesGarantia" INTEGER;

-- AlterTable
ALTER TABLE "OrdenTrabajo" ADD COLUMN "garantiaId" INTEGER;

-- CreateTable
CREATE TABLE "Garantia" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "facturaId" INTEGER,
    "facturaItemId" INTEGER,
    "articuloId" INTEGER NOT NULL,
    "nroSerie" VARCHAR(80),
    "nroImei" VARCHAR(20),
    "descripcionEquipo" VARCHAR(200),
    "clienteId" INTEGER NOT NULL,
    "fechaVenta" TIMESTAMP(3) NOT NULL,
    "mesesGarantia" INTEGER NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "estado" VARCHAR(12) NOT NULL DEFAULT 'vigente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Garantia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GarantiaUso" (
    "id" SERIAL NOT NULL,
    "garantiaId" INTEGER NOT NULL,
    "otId" INTEGER,
    "descripcion" VARCHAR(500) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "GarantiaUso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Garantia_tenantId_nroSerie_idx" ON "Garantia"("tenantId", "nroSerie");

-- CreateIndex
CREATE INDEX "Garantia_tenantId_nroImei_idx" ON "Garantia"("tenantId", "nroImei");

-- CreateIndex
CREATE INDEX "Garantia_tenantId_clienteId_idx" ON "Garantia"("tenantId", "clienteId");

-- CreateIndex
CREATE INDEX "Garantia_tenantId_fechaVencimiento_idx" ON "Garantia"("tenantId", "fechaVencimiento");

-- CreateIndex
CREATE INDEX "Garantia_tenantId_estado_idx" ON "Garantia"("tenantId", "estado");

-- CreateIndex
CREATE INDEX "Garantia_tenantId_articuloId_idx" ON "Garantia"("tenantId", "articuloId");

-- CreateIndex
CREATE INDEX "Garantia_facturaId_idx" ON "Garantia"("facturaId");

-- CreateIndex
CREATE INDEX "Garantia_facturaItemId_idx" ON "Garantia"("facturaItemId");

-- CreateIndex
CREATE INDEX "GarantiaUso_garantiaId_idx" ON "GarantiaUso"("garantiaId");

-- CreateIndex
CREATE INDEX "GarantiaUso_otId_idx" ON "GarantiaUso"("otId");

-- CreateIndex
CREATE INDEX "GarantiaUso_userId_idx" ON "GarantiaUso"("userId");

-- CreateIndex
CREATE INDEX "OrdenTrabajo_tenantId_garantiaId_idx" ON "OrdenTrabajo"("tenantId", "garantiaId");

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_garantiaId_fkey" FOREIGN KEY ("garantiaId") REFERENCES "Garantia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Garantia" ADD CONSTRAINT "Garantia_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Garantia" ADD CONSTRAINT "Garantia_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Garantia" ADD CONSTRAINT "Garantia_facturaItemId_fkey" FOREIGN KEY ("facturaItemId") REFERENCES "FacturaItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Garantia" ADD CONSTRAINT "Garantia_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Garantia" ADD CONSTRAINT "Garantia_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GarantiaUso" ADD CONSTRAINT "GarantiaUso_garantiaId_fkey" FOREIGN KEY ("garantiaId") REFERENCES "Garantia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GarantiaUso" ADD CONSTRAINT "GarantiaUso_otId_fkey" FOREIGN KEY ("otId") REFERENCES "OrdenTrabajo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GarantiaUso" ADD CONSTRAINT "GarantiaUso_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
