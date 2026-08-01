-- Mercado Libre webhook idempotency for stock sync (#185)
CREATE TABLE "MeliWebhookEvent" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER,
    "topic" VARCHAR(40) NOT NULL,
    "resource" VARCHAR(200) NOT NULL,
    "meliUserId" VARCHAR(40),
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeliWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MeliWebhookEvent_topic_resource_key" ON "MeliWebhookEvent"("topic", "resource");

CREATE INDEX "MeliWebhookEvent_tenantId_processedAt_idx" ON "MeliWebhookEvent"("tenantId", "processedAt");

ALTER TABLE "MeliWebhookEvent" ADD CONSTRAINT "MeliWebhookEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
