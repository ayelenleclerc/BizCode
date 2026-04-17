-- CreateTable
CREATE TABLE "Proveedor" (
    "id" SERIAL NOT NULL,
    "codigo" INTEGER NOT NULL,
    "rsocial" VARCHAR(30) NOT NULL,
    "fantasia" VARCHAR(30),
    "cuit" VARCHAR(14),
    "condIva" VARCHAR(10) NOT NULL,
    "telef" VARCHAR(25),
    "email" VARCHAR(50),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_codigo_key" ON "Proveedor"("codigo");
