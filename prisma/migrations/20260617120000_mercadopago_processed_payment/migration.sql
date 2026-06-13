-- CreateTable
CREATE TABLE "MercadoPagoProcessedPayment" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "mpPaymentId" VARCHAR(60) NOT NULL,
    "facturaId" INTEGER,
    "estado" VARCHAR(20) NOT NULL,
    "reciboCobroId" INTEGER,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MercadoPagoProcessedPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MercadoPagoProcessedPayment_tenantId_facturaId_idx" ON "MercadoPagoProcessedPayment"("tenantId", "facturaId");

-- CreateIndex
CREATE UNIQUE INDEX "MercadoPagoProcessedPayment_tenantId_mpPaymentId_key" ON "MercadoPagoProcessedPayment"("tenantId", "mpPaymentId");

-- AddForeignKey
ALTER TABLE "MercadoPagoProcessedPayment" ADD CONSTRAINT "MercadoPagoProcessedPayment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MercadoPagoProcessedPayment" ADD CONSTRAINT "MercadoPagoProcessedPayment_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MercadoPagoProcessedPayment" ADD CONSTRAINT "MercadoPagoProcessedPayment_reciboCobroId_fkey" FOREIGN KEY ("reciboCobroId") REFERENCES "ReciboCobro"("id") ON DELETE SET NULL ON UPDATE CASCADE;
