-- Mercado Libre orders → Pedidos (#186)
ALTER TABLE "Pedido" ADD COLUMN "origen" VARCHAR(20);

CREATE INDEX "Pedido_tenantId_origen_idx" ON "Pedido"("tenantId", "origen");

CREATE TABLE "MeliOrden" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "meliOrderId" VARCHAR(40) NOT NULL,
    "pedidoId" INTEGER,
    "status" VARCHAR(40) NOT NULL,
    "shippingId" VARCHAR(40),
    "isFulfillment" BOOLEAN NOT NULL DEFAULT false,
    "buyerNickname" VARCHAR(120),
    "cuitPending" BOOLEAN NOT NULL DEFAULT false,
    "stockAppliedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeliOrden_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MeliOrden_pedidoId_key" ON "MeliOrden"("pedidoId");

CREATE UNIQUE INDEX "MeliOrden_tenantId_meliOrderId_key" ON "MeliOrden"("tenantId", "meliOrderId");

CREATE INDEX "MeliOrden_tenantId_status_idx" ON "MeliOrden"("tenantId", "status");

ALTER TABLE "MeliOrden" ADD CONSTRAINT "MeliOrden_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MeliOrden" ADD CONSTRAINT "MeliOrden_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE SET NULL ON UPDATE CASCADE;
