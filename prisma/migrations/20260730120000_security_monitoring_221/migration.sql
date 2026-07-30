-- AlterTable
ALTER TABLE "AppUser" ADD COLUMN "lastLoginCountry" VARCHAR(8);

-- AlterTable
ALTER TABLE "AuditEvent" ADD COLUMN "securityEventType" VARCHAR(60),
ADD COLUMN "severity" VARCHAR(20);

-- CreateIndex
CREATE INDEX "AuditEvent_securityEventType_createdAt_idx" ON "AuditEvent"("securityEventType", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_severity_createdAt_idx" ON "AuditEvent"("severity", "createdAt");

-- CreateTable
CREATE TABLE "SecurityMonitorCursor" (
    "id" TEXT NOT NULL,
    "lastAuditEventId" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityMonitorCursor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityAlertDedupe" (
    "id" SERIAL NOT NULL,
    "ruleKey" VARCHAR(80) NOT NULL,
    "subjectKey" VARCHAR(160) NOT NULL,
    "firedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityAlertDedupe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SecurityAlertDedupe_firedAt_idx" ON "SecurityAlertDedupe"("firedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityAlertDedupe_ruleKey_subjectKey_key" ON "SecurityAlertDedupe"("ruleKey", "subjectKey");
