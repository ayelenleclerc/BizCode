-- WooCommerce credentials, catalog mapping, webhooks, and orders (#188)

CREATE TABLE "WooCommerceConfig" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "storeUrl" VARCHAR(255) NOT NULL,
    "consumerKeyEncrypted" TEXT NOT NULL,
    "consumerSecretEncrypted" TEXT NOT NULL,
    "webhookSecretEncrypted" TEXT,
    "consumerKeyLast4" VARCHAR(4) NOT NULL,
    "storeName" VARCHAR(120),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "conectadoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WooCommerceConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WooCommerceConfig_tenantId_key" ON "WooCommerceConfig"("tenantId");

CREATE INDEX "WooCommerceConfig_activo_idx" ON "WooCommerceConfig"("activo");

ALTER TABLE "WooCommerceConfig" ADD CONSTRAINT "WooCommerceConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "WooCommercePublicacion" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "wcProductId" VARCHAR(40),
    "wcVariationId" VARCHAR(40),
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "permalink" VARCHAR(500),
    "syncStatus" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "syncError" TEXT,
    "ultimaSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WooCommercePublicacion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WooCommercePublicacion_articuloId_key" ON "WooCommercePublicacion"("articuloId");

CREATE UNIQUE INDEX "WooCommercePublicacion_tenantId_articuloId_key" ON "WooCommercePublicacion"("tenantId", "articuloId");

CREATE UNIQUE INDEX "WooCommercePublicacion_tenantId_wcProductId_key" ON "WooCommercePublicacion"("tenantId", "wcProductId");

CREATE INDEX "WooCommercePublicacion_tenantId_syncStatus_idx" ON "WooCommercePublicacion"("tenantId", "syncStatus");

CREATE INDEX "WooCommercePublicacion_articuloId_idx" ON "WooCommercePublicacion"("articuloId");

ALTER TABLE "WooCommercePublicacion" ADD CONSTRAINT "WooCommercePublicacion_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "WooCommerceWebhookEvent" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER,
    "topic" VARCHAR(60) NOT NULL,
    "resource" VARCHAR(200) NOT NULL,
    "deliveryId" VARCHAR(40),
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WooCommerceWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WooCommerceWebhookEvent_topic_resource_key" ON "WooCommerceWebhookEvent"("topic", "resource");

CREATE INDEX "WooCommerceWebhookEvent_tenantId_processedAt_idx" ON "WooCommerceWebhookEvent"("tenantId", "processedAt");

ALTER TABLE "WooCommerceWebhookEvent" ADD CONSTRAINT "WooCommerceWebhookEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "WooCommerceOrden" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "wcOrderId" VARCHAR(40) NOT NULL,
    "pedidoId" INTEGER,
    "status" VARCHAR(40) NOT NULL,
    "buyerNickname" VARCHAR(120),
    "cuitPending" BOOLEAN NOT NULL DEFAULT false,
    "stockAppliedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WooCommerceOrden_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WooCommerceOrden_pedidoId_key" ON "WooCommerceOrden"("pedidoId");

CREATE UNIQUE INDEX "WooCommerceOrden_tenantId_wcOrderId_key" ON "WooCommerceOrden"("tenantId", "wcOrderId");

CREATE INDEX "WooCommerceOrden_tenantId_status_idx" ON "WooCommerceOrden"("tenantId", "status");

ALTER TABLE "WooCommerceOrden" ADD CONSTRAINT "WooCommerceOrden_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "WooCommerceOrden" ADD CONSTRAINT "WooCommerceOrden_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE SET NULL ON UPDATE CASCADE;
