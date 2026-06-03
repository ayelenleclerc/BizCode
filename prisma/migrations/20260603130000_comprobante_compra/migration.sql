-- CreateTable
CREATE TABLE "ComprobanteCompra" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "proveedorId" INTEGER NOT NULL,
    "ordenCompraId" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL,
    "tipo" VARCHAR(1) NOT NULL,
    "prefijo" VARCHAR(4) NOT NULL,
    "numero" INTEGER NOT NULL,
    "neto1" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "neto2" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "neto3" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "iva1" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "iva2" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cae" VARCHAR(20),
    "caeVto" TIMESTAMP(3),
    "estado" VARCHAR(1) NOT NULL DEFAULT 'A',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComprobanteCompra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComprobanteCompra_tenantId_fecha_idx" ON "ComprobanteCompra"("tenantId", "fecha");

-- CreateIndex
CREATE INDEX "ComprobanteCompra_tenantId_proveedorId_idx" ON "ComprobanteCompra"("tenantId", "proveedorId");

-- CreateIndex
CREATE INDEX "ComprobanteCompra_tenantId_estado_fecha_idx" ON "ComprobanteCompra"("tenantId", "estado", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "ComprobanteCompra_tenantId_tipo_prefijo_numero_key" ON "ComprobanteCompra"("tenantId", "tipo", "prefijo", "numero");

-- AddForeignKey
ALTER TABLE "ComprobanteCompra" ADD CONSTRAINT "ComprobanteCompra_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComprobanteCompra" ADD CONSTRAINT "ComprobanteCompra_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComprobanteCompra" ADD CONSTRAINT "ComprobanteCompra_ordenCompraId_fkey" FOREIGN KEY ("ordenCompraId") REFERENCES "OrdenCompra"("id") ON DELETE SET NULL ON UPDATE CASCADE;
