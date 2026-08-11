-- #172 App Seller push notifications (shared device tokens for #165)

CREATE TABLE IF NOT EXISTS "DevicePushToken" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "platform" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DevicePushToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DevicePushToken_token_key" ON "DevicePushToken"("token");
CREATE INDEX IF NOT EXISTS "DevicePushToken_tenantId_userId_idx" ON "DevicePushToken"("tenantId", "userId");

CREATE TABLE IF NOT EXISTS "PushNotificationPreference" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "mutedTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PushNotificationPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PushNotificationPreference_tenantId_userId_key"
  ON "PushNotificationPreference"("tenantId", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "PushNotificationPreference_userId_key"
  ON "PushNotificationPreference"("userId");

DO $$ BEGIN
  ALTER TABLE "DevicePushToken" ADD CONSTRAINT "DevicePushToken_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DevicePushToken" ADD CONSTRAINT "DevicePushToken_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "PushNotificationPreference" ADD CONSTRAINT "PushNotificationPreference_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "PushNotificationPreference" ADD CONSTRAINT "PushNotificationPreference_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
