-- CreateTable
CREATE TABLE "PresentacionRetencion" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "formato" VARCHAR(10) NOT NULL,
    "periodo" VARCHAR(7) NOT NULL,
    "totalOperaciones" INTEGER NOT NULL,
    "totalImporte" DECIMAL(14,2) NOT NULL,
    "archivoHash" VARCHAR(64),
    "archivoContenido" TEXT NOT NULL,
    "presentadoAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER,

    CONSTRAINT "PresentacionRetencion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PresentacionRetencion_tenantId_formato_periodo_idx" ON "PresentacionRetencion"("tenantId", "formato", "periodo");

-- AddForeignKey
ALTER TABLE "PresentacionRetencion" ADD CONSTRAINT "PresentacionRetencion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentacionRetencion" ADD CONSTRAINT "PresentacionRetencion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
