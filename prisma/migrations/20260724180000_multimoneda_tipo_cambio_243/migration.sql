-- AlterTable Articulo FX fields
ALTER TABLE "Articulo" ADD COLUMN "monedaPrecio" VARCHAR(3) NOT NULL DEFAULT 'ARS';
ALTER TABLE "Articulo" ADD COLUMN "precioEnMonedaOrigen" DECIMAL(14,4);

-- AlterTable TenantConfig preferred FX type
ALTER TABLE "TenantConfig" ADD COLUMN "tipoCambioPreferido" VARCHAR(20) NOT NULL DEFAULT 'oficial';

-- AlterTable Factura FX snapshot
ALTER TABLE "Factura" ADD COLUMN "tipoCambioId" INTEGER;
ALTER TABLE "Factura" ADD COLUMN "tipoCambioValor" DECIMAL(14,4);
ALTER TABLE "Factura" ADD COLUMN "tipoCambioMoneda" VARCHAR(3);
ALTER TABLE "Factura" ADD COLUMN "tipoCambioTipo" VARCHAR(20);
ALTER TABLE "Factura" ADD COLUMN "tipoCambioFecha" TIMESTAMP(3);

-- AlterTable FacturaItem FX line snapshot
ALTER TABLE "FacturaItem" ADD COLUMN "monedaOrigen" VARCHAR(3);
ALTER TABLE "FacturaItem" ADD COLUMN "precioOrigen" DECIMAL(14,4);
ALTER TABLE "FacturaItem" ADD COLUMN "tipoCambioValor" DECIMAL(14,4);

-- CreateTable TipoCambio
CREATE TABLE "TipoCambio" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "moneda" VARCHAR(3) NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "valor" DECIMAL(14,4) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fuente" VARCHAR(20) NOT NULL,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TipoCambio_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TipoCambio_tenantId_moneda_tipo_fecha_idx" ON "TipoCambio"("tenantId", "moneda", "tipo", "fecha");
CREATE INDEX "TipoCambio_tenantId_fecha_idx" ON "TipoCambio"("tenantId", "fecha");
CREATE INDEX "Factura_tenantId_tipoCambioId_idx" ON "Factura"("tenantId", "tipoCambioId");

ALTER TABLE "TipoCambio" ADD CONSTRAINT "TipoCambio_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TipoCambio" ADD CONSTRAINT "TipoCambio_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_tipoCambioId_fkey" FOREIGN KEY ("tipoCambioId") REFERENCES "TipoCambio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
