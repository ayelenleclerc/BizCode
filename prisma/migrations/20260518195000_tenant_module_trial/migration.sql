-- CreateTable
CREATE TABLE "TenantModuleTrial" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "moduleKey" VARCHAR(80) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantModuleTrial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantModuleTrial_tenantId_moduleKey_key" ON "TenantModuleTrial"("tenantId", "moduleKey");

-- CreateIndex
CREATE INDEX "TenantModuleTrial_tenantId_active_expiresAt_idx" ON "TenantModuleTrial"("tenantId", "active", "expiresAt");

-- AddForeignKey
ALTER TABLE "TenantModuleTrial" ADD CONSTRAINT "TenantModuleTrial_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
