-- CreateTable
CREATE TABLE "Remito" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "prefijo" VARCHAR(4),
    "numero" INTEGER,
    "tipo" VARCHAR(20) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'borrador',
    "clienteId" INTEGER,
    "proveedorId" INTEGER,
    "facturaId" INTEGER,
    "pedidoId" INTEGER,
    "ordenEntregaId" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEntrega" TIMESTAMP(3),
    "observaciones" VARCHAR(500),
    "firmadoPor" VARCHAR(120),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Remito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RemitoItem" (
    "id" SERIAL NOT NULL,
    "remitoId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "descripcion" VARCHAR(120) NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "unidad" VARCHAR(6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RemitoItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Remito_pedidoId_key" ON "Remito"("pedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "Remito_ordenEntregaId_key" ON "Remito"("ordenEntregaId");

-- CreateIndex
CREATE UNIQUE INDEX "Remito_tenantId_prefijo_numero_key" ON "Remito"("tenantId", "prefijo", "numero");

-- CreateIndex
CREATE INDEX "Remito_tenantId_estado_idx" ON "Remito"("tenantId", "estado");

-- CreateIndex
CREATE INDEX "Remito_tenantId_clienteId_idx" ON "Remito"("tenantId", "clienteId");

-- CreateIndex
CREATE INDEX "Remito_tenantId_fecha_idx" ON "Remito"("tenantId", "fecha");

-- AddForeignKey
ALTER TABLE "Remito" ADD CONSTRAINT "Remito_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remito" ADD CONSTRAINT "Remito_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remito" ADD CONSTRAINT "Remito_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remito" ADD CONSTRAINT "Remito_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remito" ADD CONSTRAINT "Remito_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remito" ADD CONSTRAINT "Remito_ordenEntregaId_fkey" FOREIGN KEY ("ordenEntregaId") REFERENCES "OrdenEntrega"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemitoItem" ADD CONSTRAINT "RemitoItem_remitoId_fkey" FOREIGN KEY ("remitoId") REFERENCES "Remito"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemitoItem" ADD CONSTRAINT "RemitoItem_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
