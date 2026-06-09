-- CreateTable
CREATE TABLE "NotaCredito" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "facturaOrigenId" INTEGER NOT NULL,
    "motivo" VARCHAR(500) NOT NULL,
    "monto" DECIMAL(14,2) NOT NULL,
    "cae" VARCHAR(20),
    "caeVto" TIMESTAMP(3),
    "estadoCae" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotaCredito_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotaCredito_tenantId_facturaOrigenId_key" ON "NotaCredito"("tenantId", "facturaOrigenId");

-- CreateIndex
CREATE INDEX "NotaCredito_tenantId_createdAt_idx" ON "NotaCredito"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "NotaCredito_tenantId_facturaOrigenId_idx" ON "NotaCredito"("tenantId", "facturaOrigenId");

-- AddForeignKey
ALTER TABLE "NotaCredito" ADD CONSTRAINT "NotaCredito_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaCredito" ADD CONSTRAINT "NotaCredito_facturaOrigenId_fkey" FOREIGN KEY ("facturaOrigenId") REFERENCES "Factura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaCredito" ADD CONSTRAINT "NotaCredito_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
