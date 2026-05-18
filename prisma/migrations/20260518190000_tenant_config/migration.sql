-- CreateTable
CREATE TABLE "TenantConfig" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "businessType" VARCHAR(20) NOT NULL DEFAULT 'ambos',
    "rubros" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "plan" VARCHAR(20) NOT NULL DEFAULT 'starter',
    "modules" TEXT[] NOT NULL,
    "integrations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedById" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantConfigHistory" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "changedById" INTEGER NOT NULL,
    "before" JSONB NOT NULL,
    "after" JSONB NOT NULL,
    "reason" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantConfigHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantConfig_tenantId_key" ON "TenantConfig"("tenantId");

-- CreateIndex
CREATE INDEX "TenantConfig_tenantId_idx" ON "TenantConfig"("tenantId");

-- CreateIndex
CREATE INDEX "TenantConfigHistory_tenantId_createdAt_idx" ON "TenantConfigHistory"("tenantId", "createdAt");

-- AddForeignKey
ALTER TABLE "TenantConfig" ADD CONSTRAINT "TenantConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantConfig" ADD CONSTRAINT "TenantConfig_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantConfigHistory" ADD CONSTRAINT "TenantConfigHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: default module set + billing.orders for tenants that already shipped pedidos (#132)
INSERT INTO "TenantConfig" ("tenantId", "businessType", "rubros", "plan", "modules", "integrations", "updatedAt")
SELECT
    t."id",
    'ambos',
    ARRAY[]::TEXT[],
    'starter',
    ARRAY[
        'core.auth', 'core.catalog', 'core.clients', 'core.invoicing',
        'billing.afip_cae', 'billing.credit_notes', 'billing.orders',
        'finance.collections', 'finance.receipts', 'finance.ledger',
        'fiscal.remito', 'fiscal.cheques', 'finance.retenciones',
        'comms.notifications', 'analytics.dashboard', 'admin.audit_log',
        'service.warranties'
    ]::TEXT[],
    ARRAY[]::TEXT[],
    CURRENT_TIMESTAMP
FROM "Tenant" t
WHERE NOT EXISTS (SELECT 1 FROM "TenantConfig" tc WHERE tc."tenantId" = t."id");
