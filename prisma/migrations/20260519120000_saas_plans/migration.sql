-- CreateTable
CREATE TABLE "Plan" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(20) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "monthlyPrice" INTEGER NOT NULL DEFAULT 0,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'ARS',
    "maxUsers" INTEGER,
    "maxInvoicesPerMonth" INTEGER,
    "features" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantPlan" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "changedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_key_key" ON "Plan"("key");

-- CreateIndex
CREATE UNIQUE INDEX "TenantPlan_tenantId_key" ON "TenantPlan"("tenantId");

-- CreateIndex
CREATE INDEX "TenantPlan_tenantId_idx" ON "TenantPlan"("tenantId");

-- CreateIndex
CREATE INDEX "TenantPlan_planId_idx" ON "TenantPlan"("planId");

-- AddForeignKey
ALTER TABLE "TenantPlan" ADD CONSTRAINT "TenantPlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantPlan" ADD CONSTRAINT "TenantPlan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantPlan" ADD CONSTRAINT "TenantPlan_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed plans (draft limits #181)
INSERT INTO "Plan" ("key", "name", "monthlyPrice", "currency", "maxUsers", "maxInvoicesPerMonth", "features", "active", "updatedAt")
VALUES
  ('starter', 'Starter', 0, 'ARS', 3, 100, '[]'::jsonb, true, CURRENT_TIMESTAMP),
  ('pro', 'Pro', 15000, 'ARS', 10, 500, '["apps.driver"]'::jsonb, true, CURRENT_TIMESTAMP),
  ('enterprise', 'Enterprise', 45000, 'ARS', NULL, NULL, '["apps.driver","apps.seller"]'::jsonb, true, CURRENT_TIMESTAMP),
  ('trial', 'Trial', 0, 'ARS', 3, 50, '[]'::jsonb, true, CURRENT_TIMESTAMP);

-- Backfill TenantPlan from TenantConfig.plan (default starter)
INSERT INTO "TenantPlan" ("tenantId", "planId", "status", "startedAt", "updatedAt")
SELECT tc."tenantId", p."id", 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "TenantConfig" tc
INNER JOIN "Plan" p ON p."key" = CASE
  WHEN tc."plan" IN ('starter', 'pro', 'enterprise', 'trial') THEN tc."plan"
  ELSE 'starter'
END
ON CONFLICT ("tenantId") DO NOTHING;

-- Tenants without TenantConfig row
INSERT INTO "TenantPlan" ("tenantId", "planId", "status", "startedAt", "updatedAt")
SELECT t."id", p."id", 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Tenant" t
INNER JOIN "Plan" p ON p."key" = 'starter'
WHERE NOT EXISTS (SELECT 1 FROM "TenantPlan" tp WHERE tp."tenantId" = t."id");
