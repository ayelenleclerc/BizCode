-- Issue #169: App Seller order-taking metadata (warehouse notes + collection terms).

ALTER TABLE "Pedido" ADD COLUMN "observaciones" VARCHAR(500);
ALTER TABLE "Pedido" ADD COLUMN "condicionCobro" VARCHAR(20);
ALTER TABLE "Pedido" ADD COLUMN "plazoDias" INTEGER;
