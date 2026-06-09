-- CreateTable
CREATE TABLE "MovimientoProveedorCC" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "proveedorId" INTEGER NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "referencia" VARCHAR(40),
    "monto" DECIMAL(14,2) NOT NULL,
    "saldoPost" DECIMAL(14,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "notas" VARCHAR(500),
    "comprobanteCompraId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoProveedorCC_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MovimientoProveedorCC_comprobanteCompraId_key" ON "MovimientoProveedorCC"("comprobanteCompraId");

-- CreateIndex
CREATE INDEX "MovimientoProveedorCC_tenantId_proveedorId_fecha_idx" ON "MovimientoProveedorCC"("tenantId", "proveedorId", "fecha");

-- CreateIndex
CREATE INDEX "MovimientoProveedorCC_tenantId_proveedorId_idx" ON "MovimientoProveedorCC"("tenantId", "proveedorId");

-- AddForeignKey
ALTER TABLE "MovimientoProveedorCC" ADD CONSTRAINT "MovimientoProveedorCC_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoProveedorCC" ADD CONSTRAINT "MovimientoProveedorCC_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoProveedorCC" ADD CONSTRAINT "MovimientoProveedorCC_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoProveedorCC" ADD CONSTRAINT "MovimientoProveedorCC_comprobanteCompraId_fkey" FOREIGN KEY ("comprobanteCompraId") REFERENCES "ComprobanteCompra"("id") ON DELETE SET NULL ON UPDATE CASCADE;
