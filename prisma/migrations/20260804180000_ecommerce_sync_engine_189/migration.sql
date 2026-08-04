-- EcommerceSyncJob + SyncLog (#189)
CREATE TABLE "EcommerceSyncJob" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "connectorType" VARCHAR(40) NOT NULL,
    "operation" VARCHAR(40) NOT NULL,
    "payload" JSONB NOT NULL,
    "idempotencyKey" VARCHAR(200) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastError" TEXT,
    "articuloId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcommerceSyncJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SyncLog" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "connectorType" VARCHAR(40) NOT NULL,
    "operation" VARCHAR(40) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "errorMsg" TEXT,
    "jobId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EcommerceSyncJob_idempotencyKey_key" ON "EcommerceSyncJob"("idempotencyKey");
CREATE INDEX "EcommerceSyncJob_status_nextAttemptAt_idx" ON "EcommerceSyncJob"("status", "nextAttemptAt");
CREATE INDEX "EcommerceSyncJob_tenantId_connectorType_idx" ON "EcommerceSyncJob"("tenantId", "connectorType");
CREATE INDEX "EcommerceSyncJob_tenantId_articuloId_operation_status_idx" ON "EcommerceSyncJob"("tenantId", "articuloId", "operation", "status");
CREATE INDEX "SyncLog_tenantId_connectorType_createdAt_idx" ON "SyncLog"("tenantId", "connectorType", "createdAt");
CREATE INDEX "SyncLog_tenantId_status_createdAt_idx" ON "SyncLog"("tenantId", "status", "createdAt");

ALTER TABLE "EcommerceSyncJob" ADD CONSTRAINT "EcommerceSyncJob_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SyncLog" ADD CONSTRAINT "SyncLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;