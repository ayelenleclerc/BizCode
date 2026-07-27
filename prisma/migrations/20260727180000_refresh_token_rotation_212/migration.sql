-- Refresh token rotation + session family (#212)
ALTER TABLE "AppSession" ADD COLUMN IF NOT EXISTS "tokenFamily" VARCHAR(36);

-- Backfill existing sessions with a family id so NOT NULL can apply
UPDATE "AppSession"
SET "tokenFamily" = md5(random()::text || id::text || clock_timestamp()::text)
WHERE "tokenFamily" IS NULL OR "tokenFamily" = '';

ALTER TABLE "AppSession" ALTER COLUMN "tokenFamily" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "AppSession_userId_tokenFamily_idx" ON "AppSession"("userId", "tokenFamily");
CREATE INDEX IF NOT EXISTS "AppSession_tokenFamily_idx" ON "AppSession"("tokenFamily");

CREATE TABLE IF NOT EXISTS "AppRefreshToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenFamily" VARCHAR(36) NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" VARCHAR(255),
    "ipAddress" VARCHAR(64),

    CONSTRAINT "AppRefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AppRefreshToken_tokenHash_key" ON "AppRefreshToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "AppRefreshToken_userId_tokenFamily_idx" ON "AppRefreshToken"("userId", "tokenFamily");
CREATE INDEX IF NOT EXISTS "AppRefreshToken_tokenFamily_idx" ON "AppRefreshToken"("tokenFamily");
CREATE INDEX IF NOT EXISTS "AppRefreshToken_expiresAt_idx" ON "AppRefreshToken"("expiresAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AppRefreshToken_userId_fkey'
  ) THEN
    ALTER TABLE "AppRefreshToken"
      ADD CONSTRAINT "AppRefreshToken_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
