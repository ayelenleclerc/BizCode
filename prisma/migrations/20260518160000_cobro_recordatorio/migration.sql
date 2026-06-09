-- AlterTable
ALTER TABLE "ParamEmpresa" ADD COLUMN "recordatorioDiasGracia" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CobroRecordatorio" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "facturaId" INTEGER NOT NULL,
    "canal" VARCHAR(20) NOT NULL,
    "enviadoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CobroRecordatorio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CobroRecordatorio_tenantId_facturaId_enviadoAt_idx" ON "CobroRecordatorio"("tenantId", "facturaId", "enviadoAt");

-- AddForeignKey
ALTER TABLE "CobroRecordatorio" ADD CONSTRAINT "CobroRecordatorio_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CobroRecordatorio" ADD CONSTRAINT "CobroRecordatorio_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
