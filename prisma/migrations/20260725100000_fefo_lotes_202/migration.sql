-- FEFO / inventory lots (#202)

ALTER TABLE "Articulo" ADD COLUMN "controlLote" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "ConfigFefo" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "diasAlertaVencimiento" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigFefo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ConfigFefo_tenantId_key" ON "ConfigFefo"("tenantId");

ALTER TABLE "ConfigFefo" ADD CONSTRAINT "ConfigFefo_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Lote" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "depositoId" INTEGER NOT NULL,
    "proveedorId" INTEGER,
    "nroLote" VARCHAR(60) NOT NULL,
    "fechaVencimiento" DATE NOT NULL,
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stockInicial" INTEGER NOT NULL,
    "stockActual" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "preavisoEnviadoAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Lote_tenantId_articuloId_depositoId_nroLote_key" ON "Lote"("tenantId", "articuloId", "depositoId", "nroLote");
CREATE INDEX "Lote_tenantId_idx" ON "Lote"("tenantId");
CREATE INDEX "Lote_tenantId_articuloId_depositoId_fechaVencimiento_idx" ON "Lote"("tenantId", "articuloId", "depositoId", "fechaVencimiento");
CREATE INDEX "Lote_tenantId_fechaVencimiento_idx" ON "Lote"("tenantId", "fechaVencimiento");
CREATE INDEX "Lote_tenantId_activo_stockActual_idx" ON "Lote"("tenantId", "activo", "stockActual");

ALTER TABLE "Lote" ADD CONSTRAINT "Lote_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_depositoId_fkey" FOREIGN KEY ("depositoId") REFERENCES "Deposito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PedidoItem" ADD COLUMN "loteId" INTEGER;
CREATE INDEX "PedidoItem_loteId_idx" ON "PedidoItem"("loteId");
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FacturaItem" ADD COLUMN "loteId" INTEGER;
CREATE INDEX "FacturaItem_loteId_idx" ON "FacturaItem"("loteId");
ALTER TABLE "FacturaItem" ADD CONSTRAINT "FacturaItem_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "StockAjuste" ADD COLUMN "loteId" INTEGER;
CREATE INDEX "StockAjuste_loteId_idx" ON "StockAjuste"("loteId");
ALTER TABLE "StockAjuste" ADD CONSTRAINT "StockAjuste_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
