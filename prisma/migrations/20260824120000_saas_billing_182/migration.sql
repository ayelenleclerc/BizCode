-- Platform SaaS billing (#182)
CREATE TABLE "SaasSubscription" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "planKey" VARCHAR(20) NOT NULL,
    "status" VARCHAR(32) NOT NULL,
    "mpPreapprovalId" VARCHAR(80),
    "initPoint" VARCHAR(500),
    "mock" BOOLEAN NOT NULL DEFAULT false,
    "paymentRetryCount" INTEGER NOT NULL DEFAULT 0,
    "lastPaymentFailedAt" TIMESTAMP(3),
    "cancelReason" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaasSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SaasSubscription_tenantId_key" ON "SaasSubscription"("tenantId");
CREATE UNIQUE INDEX "SaasSubscription_mpPreapprovalId_key" ON "SaasSubscription"("mpPreapprovalId");

ALTER TABLE "SaasSubscription" ADD CONSTRAINT "SaasSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "SaasInvoice" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "subscriptionId" INTEGER,
    "planKey" VARCHAR(20) NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" VARCHAR(8) NOT NULL DEFAULT 'ARS',
    "status" VARCHAR(20) NOT NULL,
    "mpPaymentId" VARCHAR(80),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaasInvoice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SaasInvoice_mpPaymentId_key" ON "SaasInvoice"("mpPaymentId");
CREATE INDEX "SaasInvoice_tenantId_createdAt_idx" ON "SaasInvoice"("tenantId", "createdAt");
CREATE INDEX "SaasInvoice_subscriptionId_idx" ON "SaasInvoice"("subscriptionId");

ALTER TABLE "SaasInvoice" ADD CONSTRAINT "SaasInvoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SaasInvoice" ADD CONSTRAINT "SaasInvoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "SaasSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "SaasWebhookEvent" (
    "id" SERIAL NOT NULL,
    "idempotencyKey" VARCHAR(160) NOT NULL,
    "eventType" VARCHAR(80) NOT NULL,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaasWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SaasWebhookEvent_idempotencyKey_key" ON "SaasWebhookEvent"("idempotencyKey");
