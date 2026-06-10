-- CreateTable
CREATE TABLE "MovimientoClienteCC" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "referencia" VARCHAR(40),
    "monto" DECIMAL(14,2) NOT NULL,
    "saldoPost" DECIMAL(14,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "notas" VARCHAR(500),
    "facturaId" INTEGER,
    "cobroId" INTEGER,
    "notaCreditoId" INTEGER,
    "chequeId" INTEGER,
    "retencionAplicadaId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoClienteCC_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MovimientoClienteCC_facturaId_key" ON "MovimientoClienteCC"("facturaId");

-- CreateIndex
CREATE UNIQUE INDEX "MovimientoClienteCC_cobroId_key" ON "MovimientoClienteCC"("cobroId");

-- CreateIndex
CREATE UNIQUE INDEX "MovimientoClienteCC_notaCreditoId_key" ON "MovimientoClienteCC"("notaCreditoId");

-- CreateIndex
CREATE UNIQUE INDEX "MovimientoClienteCC_chequeId_key" ON "MovimientoClienteCC"("chequeId");

-- CreateIndex
CREATE UNIQUE INDEX "MovimientoClienteCC_retencionAplicadaId_key" ON "MovimientoClienteCC"("retencionAplicadaId");

-- CreateIndex
CREATE INDEX "MovimientoClienteCC_tenantId_clienteId_fecha_idx" ON "MovimientoClienteCC"("tenantId", "clienteId", "fecha");

-- CreateIndex
CREATE INDEX "MovimientoClienteCC_tenantId_clienteId_idx" ON "MovimientoClienteCC"("tenantId", "clienteId");

-- AddForeignKey
ALTER TABLE "MovimientoClienteCC" ADD CONSTRAINT "MovimientoClienteCC_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoClienteCC" ADD CONSTRAINT "MovimientoClienteCC_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoClienteCC" ADD CONSTRAINT "MovimientoClienteCC_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoClienteCC" ADD CONSTRAINT "MovimientoClienteCC_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoClienteCC" ADD CONSTRAINT "MovimientoClienteCC_cobroId_fkey" FOREIGN KEY ("cobroId") REFERENCES "Cobro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoClienteCC" ADD CONSTRAINT "MovimientoClienteCC_notaCreditoId_fkey" FOREIGN KEY ("notaCreditoId") REFERENCES "NotaCredito"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoClienteCC" ADD CONSTRAINT "MovimientoClienteCC_chequeId_fkey" FOREIGN KEY ("chequeId") REFERENCES "Cheque"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoClienteCC" ADD CONSTRAINT "MovimientoClienteCC_retencionAplicadaId_fkey" FOREIGN KEY ("retencionAplicadaId") REFERENCES "RetencionAplicada"("id") ON DELETE SET NULL ON UPDATE CASCADE;
