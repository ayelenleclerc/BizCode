-- Durable Mercado Pago webhook inbox (#447)
CREATE TABLE "MercadoPagoWebhookInbox" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "eventKey" VARCHAR(120) NOT NULL,
    "resourceType" VARCHAR(20) NOT NULL,
    "resourceId" VARCHAR(60) NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastError" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MercadoPagoWebhookInbox_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MercadoPagoWebhookInbox_tenantId_eventKey_key" ON "MercadoPagoWebhookInbox"("tenantId", "eventKey");
CREATE INDEX "MercadoPagoWebhookInbox_estado_nextAttemptAt_idx" ON "MercadoPagoWebhookInbox"("estado", "nextAttemptAt");
CREATE INDEX "MercadoPagoWebhookInbox_tenantId_estado_idx" ON "MercadoPagoWebhookInbox"("tenantId", "estado");

ALTER TABLE "MercadoPagoWebhookInbox" ADD CONSTRAINT "MercadoPagoWebhookInbox_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
