-- Issue #253: App Seller order templates (PlantillaPedido / PlantillaPedidoItem).

CREATE TABLE "PlantillaPedido" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "vendedorId" INTEGER,
    "nombre" VARCHAR(80) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantillaPedido_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlantillaPedidoItem" (
    "id" SERIAL NOT NULL,
    "plantillaId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "cantidad" DECIMAL(14,4) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlantillaPedidoItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PlantillaPedido_tenantId_clienteId_idx" ON "PlantillaPedido"("tenantId", "clienteId");
CREATE INDEX "PlantillaPedido_tenantId_vendedorId_idx" ON "PlantillaPedido"("tenantId", "vendedorId");
CREATE INDEX "PlantillaPedidoItem_plantillaId_orden_idx" ON "PlantillaPedidoItem"("plantillaId", "orden");
CREATE INDEX "PlantillaPedidoItem_articuloId_idx" ON "PlantillaPedidoItem"("articuloId");

ALTER TABLE "PlantillaPedido" ADD CONSTRAINT "PlantillaPedido_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PlantillaPedido" ADD CONSTRAINT "PlantillaPedido_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PlantillaPedido" ADD CONSTRAINT "PlantillaPedido_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PlantillaPedidoItem" ADD CONSTRAINT "PlantillaPedidoItem_plantillaId_fkey" FOREIGN KEY ("plantillaId") REFERENCES "PlantillaPedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlantillaPedidoItem" ADD CONSTRAINT "PlantillaPedidoItem_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
