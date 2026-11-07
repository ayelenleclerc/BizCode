-- #448: mark PaymentTransaction amounts as verified vs pending reconciliation
ALTER TABLE "PaymentTransaction" ADD COLUMN "amountVerified" BOOLEAN NOT NULL DEFAULT true;
