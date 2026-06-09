-- AlterTable: warehouse picking fields on OrdenEntrega (#143)
ALTER TABLE "OrdenEntrega" ADD COLUMN "pickerUserId" INTEGER,
ADD COLUMN "pickingIniciadoAt" TIMESTAMP(3),
ADD COLUMN "pickingListoAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "OrdenEntrega_tenantId_pickerUserId_idx" ON "OrdenEntrega"("tenantId", "pickerUserId");

-- AddForeignKey
ALTER TABLE "OrdenEntrega" ADD CONSTRAINT "OrdenEntrega_pickerUserId_fkey" FOREIGN KEY ("pickerUserId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
