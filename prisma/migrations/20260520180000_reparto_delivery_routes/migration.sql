-- CreateTable
CREATE TABLE "Reparto" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "choferId" INTEGER NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'planned',
    "vehiculo" VARCHAR(60),
    "observaciones" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Reparto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepartoItem" (
    "id" SERIAL NOT NULL,
    "repartoId" INTEGER NOT NULL,
    "ordenEntregaId" INTEGER NOT NULL,
    "secuencia" INTEGER NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "entregadoAt" TIMESTAMP(3),
    "motivoNoEntrega" VARCHAR(200),

    CONSTRAINT "RepartoItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reparto_tenantId_fecha_idx" ON "Reparto"("tenantId", "fecha");

-- CreateIndex
CREATE INDEX "Reparto_tenantId_estado_idx" ON "Reparto"("tenantId", "estado");

-- CreateIndex
CREATE INDEX "Reparto_tenantId_choferId_idx" ON "Reparto"("tenantId", "choferId");

-- CreateIndex
CREATE INDEX "RepartoItem_repartoId_idx" ON "RepartoItem"("repartoId");

-- CreateIndex
CREATE INDEX "RepartoItem_ordenEntregaId_idx" ON "RepartoItem"("ordenEntregaId");

-- AddForeignKey
ALTER TABLE "Reparto" ADD CONSTRAINT "Reparto_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reparto" ADD CONSTRAINT "Reparto_choferId_fkey" FOREIGN KEY ("choferId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepartoItem" ADD CONSTRAINT "RepartoItem_repartoId_fkey" FOREIGN KEY ("repartoId") REFERENCES "Reparto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepartoItem" ADD CONSTRAINT "RepartoItem_ordenEntregaId_fkey" FOREIGN KEY ("ordenEntregaId") REFERENCES "OrdenEntrega"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
