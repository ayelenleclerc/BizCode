-- Generic payment operation ledger (#377 DoD). Factura.mp* and MercadoPagoProcessedPayment retained for dual-write.
CREATE TABLE "PaymentTransaction" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "providerCode" VARCHAR(30) NOT NULL,
    "externalPaymentId" VARCHAR(80),
    "externalReference" VARCHAR(120),
    "internalReference" VARCHAR(120) NOT NULL,
    "paymentType" VARCHAR(30) NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "providerStatus" VARCHAR(40),
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'ARS',
    "checkoutUrl" VARCHAR(500),
    "preferenceId" VARCHAR(80),
    "idempotencyKey" VARCHAR(120) NOT NULL,
    "facturaId" INTEGER,
    "reciboCobroId" INTEGER,
    "rawMetadata" JSONB,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentTransaction_tenantId_idempotencyKey_key" ON "PaymentTransaction"("tenantId", "idempotencyKey");
CREATE INDEX "PaymentTransaction_tenantId_providerCode_idx" ON "PaymentTransaction"("tenantId", "providerCode");
CREATE INDEX "PaymentTransaction_tenantId_facturaId_idx" ON "PaymentTransaction"("tenantId", "facturaId");
CREATE INDEX "PaymentTransaction_externalPaymentId_idx" ON "PaymentTransaction"("externalPaymentId");
CREATE INDEX "PaymentTransaction_internalReference_idx" ON "PaymentTransaction"("internalReference");

ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_reciboCobroId_fkey" FOREIGN KEY ("reciboCobroId") REFERENCES "ReciboCobro"("id") ON DELETE SET NULL ON UPDATE CASCADE;
