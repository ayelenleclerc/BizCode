-- CreateTable
CREATE TABLE "OrdenCompra" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "proveedorId" INTEGER NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "fechaEstimada" TIMESTAMP(3),
    "nota" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrdenCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdenCompraItem" (
    "id" SERIAL NOT NULL,
    "ordenCompraId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "cantidadRecibida" INTEGER NOT NULL DEFAULT 0,
    "costoUnitario" DECIMAL(14,2) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "OrdenCompraItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrdenCompra_tenantId_estado_idx" ON "OrdenCompra"("tenantId", "estado");

-- CreateIndex
CREATE INDEX "OrdenCompra_tenantId_proveedorId_idx" ON "OrdenCompra"("tenantId", "proveedorId");

-- CreateIndex
CREATE INDEX "OrdenCompraItem_ordenCompraId_idx" ON "OrdenCompraItem"("ordenCompraId");

-- CreateIndex
CREATE INDEX "OrdenCompraItem_articuloId_idx" ON "OrdenCompraItem"("articuloId");

-- AddForeignKey
ALTER TABLE "OrdenCompra" ADD CONSTRAINT "OrdenCompra_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenCompra" ADD CONSTRAINT "OrdenCompra_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenCompraItem" ADD CONSTRAINT "OrdenCompraItem_ordenCompraId_fkey" FOREIGN KEY ("ordenCompraId") REFERENCES "OrdenCompra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenCompraItem" ADD CONSTRAINT "OrdenCompraItem_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
