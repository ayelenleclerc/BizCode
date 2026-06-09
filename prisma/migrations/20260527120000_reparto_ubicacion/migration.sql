-- CreateTable: GPS location samples for delivery routes (#144)
CREATE TABLE "RepartoUbicacion" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "repartoId" INTEGER NOT NULL,
    "lat" DECIMAL(10,7) NOT NULL,
    "lng" DECIMAL(10,7) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepartoUbicacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RepartoUbicacion_repartoId_recordedAt_idx" ON "RepartoUbicacion"("repartoId", "recordedAt");

-- CreateIndex
CREATE INDEX "RepartoUbicacion_tenantId_recordedAt_idx" ON "RepartoUbicacion"("tenantId", "recordedAt");

-- AddForeignKey
ALTER TABLE "RepartoUbicacion" ADD CONSTRAINT "RepartoUbicacion_repartoId_fkey" FOREIGN KEY ("repartoId") REFERENCES "Reparto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
