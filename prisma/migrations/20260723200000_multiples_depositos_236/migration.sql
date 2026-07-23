-- Issue #236: múltiples depósitos, stock por depósito y transferencias entre almacenes.

-- CreateTable
CREATE TABLE "Deposito" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "direccion" VARCHAR(200),
    "responsableId" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "esDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deposito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockDeposito" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "depositoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "stockMin" INTEGER NOT NULL DEFAULT 0,
    "stockMax" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockDeposito_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "StockDeposito_cantidad_nonneg_check" CHECK ("cantidad" >= 0),
    CONSTRAINT "StockDeposito_stockMin_nonneg_check" CHECK ("stockMin" >= 0)
);

-- CreateTable
CREATE TABLE "TransferenciaDeposito" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "origenId" INTEGER NOT NULL,
    "destinoId" INTEGER NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    "solicitadoPorId" INTEGER NOT NULL,
    "aprobadoPorId" INTEGER,
    "fechaEnvio" TIMESTAMP(3),
    "fechaRecepcion" TIMESTAMP(3),
    "nota" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransferenciaDeposito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferenciaDepositoItem" (
    "id" SERIAL NOT NULL,
    "transferenciaId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "cantidadEnviada" INTEGER NOT NULL,
    "cantidadRecibida" INTEGER,

    CONSTRAINT "TransferenciaDepositoItem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TransferenciaDepositoItem_cantidadEnviada_pos_check" CHECK ("cantidadEnviada" > 0),
    CONSTRAINT "TransferenciaDepositoItem_cantidadRecibida_nonneg_check" CHECK ("cantidadRecibida" IS NULL OR "cantidadRecibida" >= 0)
);

-- AlterTable
ALTER TABLE "OrdenCompra" ADD COLUMN "depositoId" INTEGER;
ALTER TABLE "Recuento" ADD COLUMN "depositoId" INTEGER;
ALTER TABLE "Factura" ADD COLUMN "depositoId" INTEGER;
ALTER TABLE "Pedido" ADD COLUMN "depositoId" INTEGER;
ALTER TABLE "OrdenEntrega" ADD COLUMN "depositoId" INTEGER;
ALTER TABLE "StockAjuste" ADD COLUMN "depositoId" INTEGER;

-- CreateIndex
CREATE INDEX "Deposito_tenantId_idx" ON "Deposito"("tenantId");
CREATE INDEX "Deposito_tenantId_activo_idx" ON "Deposito"("tenantId", "activo");
CREATE INDEX "Deposito_tenantId_esDefault_idx" ON "Deposito"("tenantId", "esDefault");
CREATE UNIQUE INDEX "Deposito_tenantId_codigo_key" ON "Deposito"("tenantId", "codigo");

CREATE INDEX "StockDeposito_tenantId_idx" ON "StockDeposito"("tenantId");
CREATE INDEX "StockDeposito_tenantId_depositoId_idx" ON "StockDeposito"("tenantId", "depositoId");
CREATE INDEX "StockDeposito_tenantId_articuloId_idx" ON "StockDeposito"("tenantId", "articuloId");
CREATE UNIQUE INDEX "StockDeposito_articuloId_depositoId_key" ON "StockDeposito"("articuloId", "depositoId");

CREATE UNIQUE INDEX "TransferenciaDeposito_tenantId_numero_key" ON "TransferenciaDeposito"("tenantId", "numero");
CREATE INDEX "TransferenciaDeposito_tenantId_estado_idx" ON "TransferenciaDeposito"("tenantId", "estado");
CREATE INDEX "TransferenciaDeposito_tenantId_origenId_idx" ON "TransferenciaDeposito"("tenantId", "origenId");
CREATE INDEX "TransferenciaDeposito_tenantId_destinoId_idx" ON "TransferenciaDeposito"("tenantId", "destinoId");

CREATE UNIQUE INDEX "TransferenciaDepositoItem_transferenciaId_articuloId_key" ON "TransferenciaDepositoItem"("transferenciaId", "articuloId");
CREATE INDEX "TransferenciaDepositoItem_transferenciaId_idx" ON "TransferenciaDepositoItem"("transferenciaId");
CREATE INDEX "TransferenciaDepositoItem_articuloId_idx" ON "TransferenciaDepositoItem"("articuloId");

CREATE INDEX "OrdenCompra_tenantId_depositoId_idx" ON "OrdenCompra"("tenantId", "depositoId");
CREATE INDEX "Recuento_tenantId_depositoId_estado_idx" ON "Recuento"("tenantId", "depositoId", "estado");
CREATE INDEX "Factura_tenantId_depositoId_idx" ON "Factura"("tenantId", "depositoId");
CREATE INDEX "Pedido_tenantId_depositoId_idx" ON "Pedido"("tenantId", "depositoId");
CREATE INDEX "OrdenEntrega_tenantId_depositoId_idx" ON "OrdenEntrega"("tenantId", "depositoId");
CREATE INDEX "StockAjuste_tenantId_depositoId_idx" ON "StockAjuste"("tenantId", "depositoId");

-- AddForeignKey
ALTER TABLE "Deposito" ADD CONSTRAINT "Deposito_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Deposito" ADD CONSTRAINT "Deposito_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "StockDeposito" ADD CONSTRAINT "StockDeposito_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockDeposito" ADD CONSTRAINT "StockDeposito_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockDeposito" ADD CONSTRAINT "StockDeposito_depositoId_fkey" FOREIGN KEY ("depositoId") REFERENCES "Deposito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TransferenciaDeposito" ADD CONSTRAINT "TransferenciaDeposito_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TransferenciaDeposito" ADD CONSTRAINT "TransferenciaDeposito_origenId_fkey" FOREIGN KEY ("origenId") REFERENCES "Deposito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TransferenciaDeposito" ADD CONSTRAINT "TransferenciaDeposito_destinoId_fkey" FOREIGN KEY ("destinoId") REFERENCES "Deposito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TransferenciaDeposito" ADD CONSTRAINT "TransferenciaDeposito_solicitadoPorId_fkey" FOREIGN KEY ("solicitadoPorId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TransferenciaDeposito" ADD CONSTRAINT "TransferenciaDeposito_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TransferenciaDepositoItem" ADD CONSTRAINT "TransferenciaDepositoItem_transferenciaId_fkey" FOREIGN KEY ("transferenciaId") REFERENCES "TransferenciaDeposito"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TransferenciaDepositoItem" ADD CONSTRAINT "TransferenciaDepositoItem_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrdenCompra" ADD CONSTRAINT "OrdenCompra_depositoId_fkey" FOREIGN KEY ("depositoId") REFERENCES "Deposito"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Recuento" ADD CONSTRAINT "Recuento_depositoId_fkey" FOREIGN KEY ("depositoId") REFERENCES "Deposito"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_depositoId_fkey" FOREIGN KEY ("depositoId") REFERENCES "Deposito"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_depositoId_fkey" FOREIGN KEY ("depositoId") REFERENCES "Deposito"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrdenEntrega" ADD CONSTRAINT "OrdenEntrega_depositoId_fkey" FOREIGN KEY ("depositoId") REFERENCES "Deposito"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StockAjuste" ADD CONSTRAINT "StockAjuste_depositoId_fkey" FOREIGN KEY ("depositoId") REFERENCES "Deposito"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: default deposit per tenant + StockDeposito from Articulo.stock
INSERT INTO "Deposito" ("tenantId", "nombre", "codigo", "tipo", "activo", "esDefault", "createdAt", "updatedAt")
SELECT t."id", 'Depósito Central', 'DEFAULT', 'central', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Tenant" t
WHERE NOT EXISTS (
  SELECT 1 FROM "Deposito" d WHERE d."tenantId" = t."id" AND d."esDefault" = true
);

INSERT INTO "StockDeposito" ("tenantId", "articuloId", "depositoId", "cantidad", "stockMin", "createdAt", "updatedAt")
SELECT a."tenantId", a."id", d."id", a."stock", a."minimo", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Articulo" a
INNER JOIN "Deposito" d ON d."tenantId" = a."tenantId" AND d."esDefault" = true
WHERE NOT EXISTS (
  SELECT 1 FROM "StockDeposito" sd WHERE sd."articuloId" = a."id" AND sd."depositoId" = d."id"
);
