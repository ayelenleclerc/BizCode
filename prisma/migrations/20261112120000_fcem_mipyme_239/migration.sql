-- FCEM MiPyME local fields + ParamEmpresa detection knobs (#239).
-- Live WSFECM / AFIP MiPyME catalog remain Not evidenced.

ALTER TABLE "ParamEmpresa" ADD COLUMN "esMipyme" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ParamEmpresa" ADD COLUMN "fcemUmbralMonto" DECIMAL(14,2);

ALTER TABLE "Factura" ADD COLUMN "fcemEstado" VARCHAR(32);
ALTER TABLE "Factura" ADD COLUMN "fcemTipoCbte" INTEGER;
ALTER TABLE "Factura" ADD COLUMN "fcemPlazoPagoDias" INTEGER;
ALTER TABLE "Factura" ADD COLUMN "fcemRejectReason" VARCHAR(200);
ALTER TABLE "Factura" ADD COLUMN "fcemEmittedAt" TIMESTAMP(3);
ALTER TABLE "Factura" ADD COLUMN "fcemResolvedAt" TIMESTAMP(3);

CREATE INDEX "Factura_tenantId_fcemEstado_idx" ON "Factura"("tenantId", "fcemEstado");
