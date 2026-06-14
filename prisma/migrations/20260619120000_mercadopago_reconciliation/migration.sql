-- CreateTable
CREATE TABLE "MercadoPagoReconciliationEntry" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "mpPaymentId" VARCHAR(60) NOT NULL,
    "estado" VARCHAR(20) NOT NULL,
    "transactionAmount" DECIMAL(14,2) NOT NULL,
    "currencyId" VARCHAR(3) NOT NULL DEFAULT 'ARS',
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "payerName" VARCHAR(120),
    "payerEmail" VARCHAR(120),
    "payerIdentification" VARCHAR(20),
    "preferenceId" VARCHAR(60),
    "externalReference" VARCHAR(120),
    "facturaId" INTEGER,
    "reciboCobroId" INTEGER,
    "autoMatched" BOOLEAN NOT NULL DEFAULT false,
    "reconciledByUserId" INTEGER,
    "ignoredByUserId" INTEGER,
    "reconciledAt" TIMESTAMP(3),
    "ignoredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MercadoPagoReconciliationEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MercadoPagoReconciliationEntry_tenantId_mpPaymentId_key" ON "MercadoPagoReconciliationEntry"("tenantId", "mpPaymentId");

-- CreateIndex
CREATE INDEX "MercadoPagoReconciliationEntry_tenantId_estado_idx" ON "MercadoPagoReconciliationEntry"("tenantId", "estado");

-- CreateIndex
CREATE INDEX "MercadoPagoReconciliationEntry_tenantId_paymentDate_idx" ON "MercadoPagoReconciliationEntry"("tenantId", "paymentDate");

-- AddForeignKey
ALTER TABLE "MercadoPagoReconciliationEntry" ADD CONSTRAINT "MercadoPagoReconciliationEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MercadoPagoReconciliationEntry" ADD CONSTRAINT "MercadoPagoReconciliationEntry_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MercadoPagoReconciliationEntry" ADD CONSTRAINT "MercadoPagoReconciliationEntry_reciboCobroId_fkey" FOREIGN KEY ("reciboCobroId") REFERENCES "ReciboCobro"("id") ON DELETE SET NULL ON UPDATE CASCADE;
