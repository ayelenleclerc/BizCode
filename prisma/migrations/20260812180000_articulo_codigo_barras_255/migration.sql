-- AlterTable
ALTER TABLE "Articulo" ADD COLUMN "codigoBarras" VARCHAR(32);

-- CreateIndex
CREATE INDEX "Articulo_tenantId_codigoBarras_idx" ON "Articulo"("tenantId", "codigoBarras");

-- CreateIndex
CREATE UNIQUE INDEX "Articulo_tenantId_codigoBarras_key" ON "Articulo"("tenantId", "codigoBarras");
