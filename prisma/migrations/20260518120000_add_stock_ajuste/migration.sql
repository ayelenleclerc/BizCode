-- CreateTable
CREATE TABLE "StockAjuste" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" VARCHAR(100) NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockAjuste_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockAjuste_tenantId_articuloId_idx" ON "StockAjuste"("tenantId", "articuloId");

-- CreateIndex
CREATE INDEX "StockAjuste_tenantId_articuloId_createdAt_idx" ON "StockAjuste"("tenantId", "articuloId", "createdAt");

-- AddForeignKey
ALTER TABLE "StockAjuste" ADD CONSTRAINT "StockAjuste_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAjuste" ADD CONSTRAINT "StockAjuste_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAjuste" ADD CONSTRAINT "StockAjuste_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
