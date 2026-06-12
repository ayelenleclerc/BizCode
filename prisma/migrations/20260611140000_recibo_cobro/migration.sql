-- CreateTable
CREATE TABLE "ReciboCobro" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "totalCobrado" DECIMAL(14,2) NOT NULL,
    "concepto" VARCHAR(500),
    "estado" VARCHAR(20) NOT NULL DEFAULT 'emitido',
    "anulacionMotivo" VARCHAR(500),
    "usuarioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReciboCobro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReciboCobroForma" (
    "id" SERIAL NOT NULL,
    "reciboCobroId" INTEGER NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "importe" DECIMAL(14,2) NOT NULL,
    "chequeId" INTEGER,
    "referencia" VARCHAR(60),
    "banco" VARCHAR(50),

    CONSTRAINT "ReciboCobroForma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReciboCobroImputacion" (
    "id" SERIAL NOT NULL,
    "reciboCobroId" INTEGER NOT NULL,
    "facturaId" INTEGER NOT NULL,
    "importe" DECIMAL(14,2) NOT NULL,
    "saldoPrevio" DECIMAL(14,2) NOT NULL,
    "saldoPostPago" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "ReciboCobroImputacion_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "MovimientoClienteCC" ADD COLUMN "reciboCobroId" INTEGER;

-- AlterTable
ALTER TABLE "RetencionAplicada" ADD COLUMN "reciboCobroId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ReciboCobro_tenantId_numero_key" ON "ReciboCobro"("tenantId", "numero");

-- CreateIndex
CREATE INDEX "ReciboCobro_tenantId_clienteId_idx" ON "ReciboCobro"("tenantId", "clienteId");

-- CreateIndex
CREATE INDEX "ReciboCobro_tenantId_clienteId_fecha_idx" ON "ReciboCobro"("tenantId", "clienteId", "fecha");

-- CreateIndex
CREATE INDEX "ReciboCobroForma_reciboCobroId_idx" ON "ReciboCobroForma"("reciboCobroId");

-- CreateIndex
CREATE INDEX "ReciboCobroImputacion_reciboCobroId_idx" ON "ReciboCobroImputacion"("reciboCobroId");

-- CreateIndex
CREATE INDEX "ReciboCobroImputacion_facturaId_idx" ON "ReciboCobroImputacion"("facturaId");

-- CreateIndex
CREATE UNIQUE INDEX "MovimientoClienteCC_reciboCobroId_key" ON "MovimientoClienteCC"("reciboCobroId");

-- AddForeignKey
ALTER TABLE "ReciboCobro" ADD CONSTRAINT "ReciboCobro_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReciboCobro" ADD CONSTRAINT "ReciboCobro_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReciboCobro" ADD CONSTRAINT "ReciboCobro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReciboCobroForma" ADD CONSTRAINT "ReciboCobroForma_reciboCobroId_fkey" FOREIGN KEY ("reciboCobroId") REFERENCES "ReciboCobro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReciboCobroForma" ADD CONSTRAINT "ReciboCobroForma_chequeId_fkey" FOREIGN KEY ("chequeId") REFERENCES "Cheque"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReciboCobroImputacion" ADD CONSTRAINT "ReciboCobroImputacion_reciboCobroId_fkey" FOREIGN KEY ("reciboCobroId") REFERENCES "ReciboCobro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReciboCobroImputacion" ADD CONSTRAINT "ReciboCobroImputacion_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoClienteCC" ADD CONSTRAINT "MovimientoClienteCC_reciboCobroId_fkey" FOREIGN KEY ("reciboCobroId") REFERENCES "ReciboCobro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetencionAplicada" ADD CONSTRAINT "RetencionAplicada_reciboCobroId_fkey" FOREIGN KEY ("reciboCobroId") REFERENCES "ReciboCobro"("id") ON DELETE SET NULL ON UPDATE CASCADE;
