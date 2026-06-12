-- AlterTable: Mercado Pago payment link fields on Factura (#175)
ALTER TABLE "Factura" ADD COLUMN "mpPreferenceId" VARCHAR(60),
ADD COLUMN "mpPaymentLink" VARCHAR(500),
ADD COLUMN "mpEstado" VARCHAR(20),
ADD COLUMN "mpPagadoAt" TIMESTAMP(3),
ADD COLUMN "mpPreferenceExpiresAt" TIMESTAMP(3);
