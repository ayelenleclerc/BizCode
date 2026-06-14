-- Mercado Pago instore QR (#177)

ALTER TABLE "Factura" ADD COLUMN "mpQrData" TEXT;
ALTER TABLE "Factura" ADD COLUMN "mpQrOrderId" VARCHAR(60);
ALTER TABLE "Factura" ADD COLUMN "mpQrExpiresAt" TIMESTAMP(3);

ALTER TABLE "MercadoPagoConfig" ADD COLUMN "collectorId" VARCHAR(30);
ALTER TABLE "MercadoPagoConfig" ADD COLUMN "externalPosId" VARCHAR(60);
ALTER TABLE "MercadoPagoConfig" ADD COLUMN "staticQrData" TEXT;
