-- CreateTable
CREATE TABLE "OrdenEntrega" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "facturaId" INTEGER,
    "clienteId" INTEGER NOT NULL,
    "zonaId" INTEGER,
    "driverId" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "nota" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrdenEntrega_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrdenEntrega_tenantId_estado_idx" ON "OrdenEntrega"("tenantId", "estado");

-- CreateIndex
CREATE INDEX "OrdenEntrega_tenantId_fecha_idx" ON "OrdenEntrega"("tenantId", "fecha");

-- CreateIndex
CREATE INDEX "OrdenEntrega_tenantId_driverId_idx" ON "OrdenEntrega"("tenantId", "driverId");

-- AddForeignKey
ALTER TABLE "OrdenEntrega" ADD CONSTRAINT "OrdenEntrega_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenEntrega" ADD CONSTRAINT "OrdenEntrega_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenEntrega" ADD CONSTRAINT "OrdenEntrega_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenEntrega" ADD CONSTRAINT "OrdenEntrega_zonaId_fkey" FOREIGN KEY ("zonaId") REFERENCES "DeliveryZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenEntrega" ADD CONSTRAINT "OrdenEntrega_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
