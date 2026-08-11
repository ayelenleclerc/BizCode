-- Seller credit/stock alert policies on TenantConfig (#256)
ALTER TABLE "TenantConfig" ADD COLUMN IF NOT EXISTS "sellerCreditOverLimitAction" VARCHAR(10) NOT NULL DEFAULT 'block';
ALTER TABLE "TenantConfig" ADD COLUMN IF NOT EXISTS "sellerCreditOverdueAction" VARCHAR(10) NOT NULL DEFAULT 'warn';
ALTER TABLE "TenantConfig" ADD COLUMN IF NOT EXISTS "sellerStockZeroAction" VARCHAR(10) NOT NULL DEFAULT 'warn';
ALTER TABLE "TenantConfig" ADD COLUMN IF NOT EXISTS "sellerStockCapQtyToAvailable" BOOLEAN NOT NULL DEFAULT true;
