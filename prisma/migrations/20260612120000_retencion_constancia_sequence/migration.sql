-- CreateTable
CREATE TABLE "RetencionConstanciaSequence" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "provincia" VARCHAR(10) NOT NULL DEFAULT '',
    "lastNum" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RetencionConstanciaSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RetencionConstanciaSequence_tenantId_tipo_provincia_key" ON "RetencionConstanciaSequence"("tenantId", "tipo", "provincia");

-- AddForeignKey
ALTER TABLE "RetencionConstanciaSequence" ADD CONSTRAINT "RetencionConstanciaSequence_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
