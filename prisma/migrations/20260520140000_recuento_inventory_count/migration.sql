-- CreateTable
CREATE TABLE "Recuento" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "operadorId" INTEGER NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recuento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecuentoItem" (
    "id" SERIAL NOT NULL,
    "recuentoId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "cantSistema" INTEGER NOT NULL,
    "cantFisica" INTEGER,

    CONSTRAINT "RecuentoItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Recuento_tenantId_estado_idx" ON "Recuento"("tenantId", "estado");

CREATE UNIQUE INDEX "Recuento_tenantId_in_progress_key" ON "Recuento"("tenantId") WHERE "estado" = 'in_progress';

-- CreateIndex
CREATE INDEX "RecuentoItem_recuentoId_idx" ON "RecuentoItem"("recuentoId");

-- CreateIndex
CREATE INDEX "RecuentoItem_articuloId_idx" ON "RecuentoItem"("articuloId");

-- CreateIndex
CREATE UNIQUE INDEX "RecuentoItem_recuentoId_articuloId_key" ON "RecuentoItem"("recuentoId", "articuloId");

-- AddForeignKey
ALTER TABLE "Recuento" ADD CONSTRAINT "Recuento_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recuento" ADD CONSTRAINT "Recuento_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecuentoItem" ADD CONSTRAINT "RecuentoItem_recuentoId_fkey" FOREIGN KEY ("recuentoId") REFERENCES "Recuento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecuentoItem" ADD CONSTRAINT "RecuentoItem_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
