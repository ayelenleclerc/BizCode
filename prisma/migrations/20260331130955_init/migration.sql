-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "codigo" INTEGER NOT NULL,
    "rsocial" VARCHAR(30) NOT NULL,
    "fantasia" VARCHAR(30),
    "cuit" VARCHAR(14),
    "condIva" VARCHAR(1) NOT NULL,
    "domicilio" VARCHAR(40),
    "localidad" VARCHAR(25),
    "cpost" VARCHAR(8),
    "telef" VARCHAR(25),
    "email" VARCHAR(50),
    "formaPago" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rubro" (
    "id" SERIAL NOT NULL,
    "codigo" INTEGER NOT NULL,
    "nombre" VARCHAR(20) NOT NULL,

    CONSTRAINT "Rubro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Articulo" (
    "id" SERIAL NOT NULL,
    "codigo" INTEGER NOT NULL,
    "descripcion" VARCHAR(30) NOT NULL,
    "rubroId" INTEGER NOT NULL,
    "condIva" VARCHAR(1) NOT NULL,
    "umedida" VARCHAR(6) NOT NULL,
    "precioLista1" DECIMAL(14,2) NOT NULL,
    "precioLista2" DECIMAL(14,2) NOT NULL,
    "costo" DECIMAL(13,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minimo" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Articulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormaPago" (
    "id" SERIAL NOT NULL,
    "codigo" INTEGER NOT NULL,
    "descripcion" VARCHAR(25) NOT NULL,
    "vto_dias" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FormaPago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Factura" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "tipo" VARCHAR(1) NOT NULL,
    "prefijo" VARCHAR(4) NOT NULL,
    "numero" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "neto1" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "neto2" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "neto3" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "iva1" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "iva2" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "formaPagoId" INTEGER,
    "estado" VARCHAR(1) NOT NULL DEFAULT 'A',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Factura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacturaItem" (
    "id" SERIAL NOT NULL,
    "facturaId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precio" DECIMAL(14,2) NOT NULL,
    "dscto" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacturaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParamEmpresa" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(40) NOT NULL,
    "cuit" VARCHAR(14) NOT NULL,
    "domicilio" VARCHAR(40),

    CONSTRAINT "ParamEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_codigo_key" ON "Cliente"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Rubro_codigo_key" ON "Rubro"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Articulo_codigo_key" ON "Articulo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "FormaPago_codigo_key" ON "FormaPago"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_tipo_prefijo_numero_key" ON "Factura"("tipo", "prefijo", "numero");

-- AddForeignKey
ALTER TABLE "Articulo" ADD CONSTRAINT "Articulo_rubroId_fkey" FOREIGN KEY ("rubroId") REFERENCES "Rubro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturaItem" ADD CONSTRAINT "FacturaItem_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturaItem" ADD CONSTRAINT "FacturaItem_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
