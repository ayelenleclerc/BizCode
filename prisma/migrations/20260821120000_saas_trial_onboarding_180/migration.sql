-- SaaS self-service onboarding trial fields (#180)
ALTER TABLE "Tenant" ADD COLUMN "saasStatus" VARCHAR(32) NOT NULL DEFAULT 'active';
ALTER TABLE "Tenant" ADD COLUMN "trialEndsAt" TIMESTAMP(3);
ALTER TABLE "Tenant" ADD COLUMN "contactEmail" VARCHAR(120);
ALTER TABLE "Tenant" ADD COLUMN "contactPhone" VARCHAR(40);

-- Existing tenants are billed/desktop installs, not on self-service trial.
UPDATE "Tenant" SET "saasStatus" = 'active' WHERE "saasStatus" IS NULL OR "saasStatus" = '';
