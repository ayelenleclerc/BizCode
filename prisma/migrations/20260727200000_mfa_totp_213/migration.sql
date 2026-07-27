-- MFA / TOTP (#213)
ALTER TABLE "AppUser" ADD COLUMN IF NOT EXISTS "mfaEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AppUser" ADD COLUMN IF NOT EXISTS "totpSecretEncrypted" TEXT;
ALTER TABLE "AppUser" ADD COLUMN IF NOT EXISTS "mfaVerifiedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "AppMfaBackupCode" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "codeHash" VARCHAR(255) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppMfaBackupCode_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AppMfaBackupCode_userId_idx" ON "AppMfaBackupCode"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AppMfaBackupCode_userId_fkey'
  ) THEN
    ALTER TABLE "AppMfaBackupCode"
      ADD CONSTRAINT "AppMfaBackupCode_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
