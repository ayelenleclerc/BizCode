-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "username" VARCHAR(60) NOT NULL,
    "ipAddress" VARCHAR(64),
    "success" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoginAttempt_tenantId_username_createdAt_idx" ON "LoginAttempt"("tenantId", "username", "createdAt");
