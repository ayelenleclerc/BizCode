-- CreateTable
CREATE TABLE "MercadoPagoRefund" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "facturaId" INTEGER NOT NULL,
    "mpPaymentId" VARCHAR(60) NOT NULL,
    "mpRefundId" VARCHAR(60),
    "monto" DECIMAL(14,2) NOT NULL,
    "motivo" VARCHAR(500) NOT NULL,
    "estado" VARCHAR(20) NOT NULL,
    "notaCreditoId" INTEGER,
    "reciboCobroId" INTEGER,
    "errorMessage" VARCHAR(500),
    "createdByUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MercadoPagoRefund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MercadoPagoChargeback" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "mpChargebackId" VARCHAR(60) NOT NULL,
    "mpPaymentId" VARCHAR(60),
    "facturaId" INTEGER,
    "estado" VARCHAR(20) NOT NULL,
    "payload" JSONB NOT NULL,
    "notifiedAt" TIMESTAMP(3),
    "resolvedByUserId" INTEGER,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MercadoPagoChargeback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MercadoPagoRefund_tenantId_facturaId_idx" ON "MercadoPagoRefund"("tenantId", "facturaId");

-- CreateIndex
CREATE INDEX "MercadoPagoRefund_tenantId_estado_idx" ON "MercadoPagoRefund"("tenantId", "estado");

-- CreateIndex
CREATE INDEX "MercadoPagoRefund_tenantId_mpPaymentId_idx" ON "MercadoPagoRefund"("tenantId", "mpPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "MercadoPagoChargeback_tenantId_mpChargebackId_key" ON "MercadoPagoChargeback"("tenantId", "mpChargebackId");

-- CreateIndex
CREATE INDEX "MercadoPagoChargeback_tenantId_estado_idx" ON "MercadoPagoChargeback"("tenantId", "estado");

-- AddForeignKey
ALTER TABLE "MercadoPagoRefund" ADD CONSTRAINT "MercadoPagoRefund_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MercadoPagoRefund" ADD CONSTRAINT "MercadoPagoRefund_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MercadoPagoRefund" ADD CONSTRAINT "MercadoPagoRefund_notaCreditoId_fkey" FOREIGN KEY ("notaCreditoId") REFERENCES "NotaCredito"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MercadoPagoRefund" ADD CONSTRAINT "MercadoPagoRefund_reciboCobroId_fkey" FOREIGN KEY ("reciboCobroId") REFERENCES "ReciboCobro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MercadoPagoRefund" ADD CONSTRAINT "MercadoPagoRefund_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MercadoPagoChargeback" ADD CONSTRAINT "MercadoPagoChargeback_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MercadoPagoChargeback" ADD CONSTRAINT "MercadoPagoChargeback_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MercadoPagoChargeback" ADD CONSTRAINT "MercadoPagoChargeback_resolvedByUserId_fkey" FOREIGN KEY ("resolvedByUserId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
