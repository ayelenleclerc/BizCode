-- CreateTable
CREATE TABLE "ReciboPago" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "proveedorId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,
    "metodoPago" VARCHAR(20) NOT NULL,
    "cbu" VARCHAR(22),
    "referencia" VARCHAR(60),
    "estado" VARCHAR(20) NOT NULL DEFAULT 'emitido',
    "notas" VARCHAR(500),
    "usuarioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReciboPago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReciboPagoFactura" (
    "id" SERIAL NOT NULL,
    "reciboPagoId" INTEGER NOT NULL,
    "comprobanteCompraId" INTEGER,
    "facturaRef" VARCHAR(40) NOT NULL,
    "monto" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "ReciboPagoFactura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReciboPago_tenantId_numero_key" ON "ReciboPago"("tenantId", "numero");

-- CreateIndex
CREATE INDEX "ReciboPago_tenantId_proveedorId_idx" ON "ReciboPago"("tenantId", "proveedorId");

-- CreateIndex
CREATE INDEX "ReciboPago_tenantId_proveedorId_fecha_idx" ON "ReciboPago"("tenantId", "proveedorId", "fecha");

-- CreateIndex
CREATE INDEX "ReciboPagoFactura_reciboPagoId_idx" ON "ReciboPagoFactura"("reciboPagoId");

-- AlterTable
ALTER TABLE "MovimientoProveedorCC" ADD COLUMN "reciboPagoId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "MovimientoProveedorCC_reciboPagoId_key" ON "MovimientoProveedorCC"("reciboPagoId");

-- AddForeignKey
ALTER TABLE "ReciboPago" ADD CONSTRAINT "ReciboPago_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReciboPago" ADD CONSTRAINT "ReciboPago_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReciboPago" ADD CONSTRAINT "ReciboPago_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReciboPagoFactura" ADD CONSTRAINT "ReciboPagoFactura_reciboPagoId_fkey" FOREIGN KEY ("reciboPagoId") REFERENCES "ReciboPago"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReciboPagoFactura" ADD CONSTRAINT "ReciboPagoFactura_comprobanteCompraId_fkey" FOREIGN KEY ("comprobanteCompraId") REFERENCES "ComprobanteCompra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoProveedorCC" ADD CONSTRAINT "MovimientoProveedorCC_reciboPagoId_fkey" FOREIGN KEY ("reciboPagoId") REFERENCES "ReciboPago"("id") ON DELETE SET NULL ON UPDATE CASCADE;
