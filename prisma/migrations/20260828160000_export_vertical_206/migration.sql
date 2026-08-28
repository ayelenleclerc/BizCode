-- AlterTable
ALTER TABLE "Factura" ADD COLUMN     "incoterm" VARCHAR(3),
ADD COLUMN     "monedaOperacion" VARCHAR(3),
ADD COLUMN     "paisDestino" VARCHAR(2),
ADD COLUMN     "totalMonedaOperacion" DECIMAL(14,2);

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "despachanteEmail" VARCHAR(160),
ADD COLUMN     "despachanteNombre" VARCHAR(120),
ADD COLUMN     "incoterm" VARCHAR(3),
ADD COLUMN     "paisDestino" VARCHAR(2);

-- AlterTable
ALTER TABLE "MovimientoClienteCC" ADD COLUMN     "moneda" VARCHAR(3) NOT NULL DEFAULT 'ARS';

-- CreateIndex
CREATE INDEX "Factura_tenantId_monedaOperacion_idx" ON "Factura"("tenantId", "monedaOperacion");

-- CreateIndex
CREATE INDEX "MovimientoClienteCC_tenantId_clienteId_moneda_fecha_idx" ON "MovimientoClienteCC"("tenantId", "clienteId", "moneda", "fecha");
