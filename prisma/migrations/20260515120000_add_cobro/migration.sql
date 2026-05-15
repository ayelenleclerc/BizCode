-- CreateTable
CREATE TABLE "Cobro" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "monto" DECIMAL(14,2) NOT NULL,
    "formaPagoId" INTEGER,
    "referencia" VARCHAR(60),
    "nota" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cobro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Cobro_tenantId_clienteId_idx" ON "Cobro"("tenantId", "clienteId");

-- CreateIndex
CREATE INDEX "Cobro_tenantId_fecha_idx" ON "Cobro"("tenantId", "fecha");

-- AddForeignKey
ALTER TABLE "Cobro" ADD CONSTRAINT "Cobro_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobro" ADD CONSTRAINT "Cobro_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobro" ADD CONSTRAINT "Cobro_formaPagoId_fkey" FOREIGN KEY ("formaPagoId") REFERENCES "FormaPago"("id") ON DELETE SET NULL ON UPDATE CASCADE;
