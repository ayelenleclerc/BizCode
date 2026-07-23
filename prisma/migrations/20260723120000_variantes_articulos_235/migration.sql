-- Issue #235: variantes de artículos — categorías, atributos, ofertas e imágenes.

-- AlterTable: widen description for variant labels
ALTER TABLE "Articulo" ALTER COLUMN "descripcion" SET DATA TYPE VARCHAR(120);

-- AlterTable: parent/variant + category fields
ALTER TABLE "Articulo" ADD COLUMN     "categoriaId" INTEGER,
ADD COLUMN     "esPadre" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "padreId" INTEGER,
ADD COLUMN     "heredaPrecio" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "precioOverride" DECIMAL(14,2),
ADD COLUMN     "costoOverride" DECIMAL(13,2);

-- CreateTable
CREATE TABLE "CategoriaArticulo" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "codigo" VARCHAR(20),
    "padreId" INTEGER,
    "precioDefault" DECIMAL(14,2),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoriaArticulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriaAtributo" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "nombre" VARCHAR(40) NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CategoriaAtributo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriaAtributoValor" (
    "id" SERIAL NOT NULL,
    "atributoId" INTEGER NOT NULL,
    "valor" VARCHAR(40) NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CategoriaAtributoValor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticuloAtributoValor" (
    "id" SERIAL NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "atributoValorId" INTEGER NOT NULL,

    CONSTRAINT "ArticuloAtributoValor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticuloImagen" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "pathOriginal" VARCHAR(260) NOT NULL,
    "pathMedium" VARCHAR(260) NOT NULL,
    "pathThumb" VARCHAR(260) NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticuloImagen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticuloOferta" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "precioOferta" DECIMAL(14,2) NOT NULL,
    "vigenciaDesde" TIMESTAMP(3) NOT NULL,
    "vigenciaHasta" TIMESTAMP(3) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticuloOferta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CategoriaArticulo_tenantId_idx" ON "CategoriaArticulo"("tenantId");

-- CreateIndex
CREATE INDEX "CategoriaArticulo_tenantId_padreId_idx" ON "CategoriaArticulo"("tenantId", "padreId");

-- CreateIndex
CREATE INDEX "CategoriaArticulo_tenantId_activo_idx" ON "CategoriaArticulo"("tenantId", "activo");

-- CreateIndex
CREATE INDEX "CategoriaAtributo_tenantId_idx" ON "CategoriaAtributo"("tenantId");

-- CreateIndex
CREATE INDEX "CategoriaAtributo_categoriaId_idx" ON "CategoriaAtributo"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaAtributo_categoriaId_nombre_key" ON "CategoriaAtributo"("categoriaId", "nombre");

-- CreateIndex
CREATE INDEX "CategoriaAtributoValor_atributoId_idx" ON "CategoriaAtributoValor"("atributoId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaAtributoValor_atributoId_valor_key" ON "CategoriaAtributoValor"("atributoId", "valor");

-- CreateIndex
CREATE INDEX "ArticuloAtributoValor_articuloId_idx" ON "ArticuloAtributoValor"("articuloId");

-- CreateIndex
CREATE INDEX "ArticuloAtributoValor_atributoValorId_idx" ON "ArticuloAtributoValor"("atributoValorId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticuloAtributoValor_articuloId_atributoValorId_key" ON "ArticuloAtributoValor"("articuloId", "atributoValorId");

-- CreateIndex
CREATE INDEX "ArticuloImagen_tenantId_articuloId_idx" ON "ArticuloImagen"("tenantId", "articuloId");

-- CreateIndex
CREATE INDEX "ArticuloImagen_articuloId_orden_idx" ON "ArticuloImagen"("articuloId", "orden");

-- CreateIndex
CREATE INDEX "ArticuloOferta_tenantId_articuloId_idx" ON "ArticuloOferta"("tenantId", "articuloId");

-- CreateIndex
CREATE INDEX "ArticuloOferta_articuloId_activa_idx" ON "ArticuloOferta"("articuloId", "activa");

-- CreateIndex
CREATE INDEX "Articulo_tenantId_padreId_idx" ON "Articulo"("tenantId", "padreId");

-- CreateIndex
CREATE INDEX "Articulo_tenantId_categoriaId_idx" ON "Articulo"("tenantId", "categoriaId");

-- CreateIndex
CREATE INDEX "Articulo_tenantId_esPadre_idx" ON "Articulo"("tenantId", "esPadre");

-- AddForeignKey
ALTER TABLE "CategoriaArticulo" ADD CONSTRAINT "CategoriaArticulo_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriaArticulo" ADD CONSTRAINT "CategoriaArticulo_padreId_fkey" FOREIGN KEY ("padreId") REFERENCES "CategoriaArticulo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriaAtributo" ADD CONSTRAINT "CategoriaAtributo_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaArticulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriaAtributoValor" ADD CONSTRAINT "CategoriaAtributoValor_atributoId_fkey" FOREIGN KEY ("atributoId") REFERENCES "CategoriaAtributo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Articulo" ADD CONSTRAINT "Articulo_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaArticulo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Articulo" ADD CONSTRAINT "Articulo_padreId_fkey" FOREIGN KEY ("padreId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticuloAtributoValor" ADD CONSTRAINT "ArticuloAtributoValor_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticuloAtributoValor" ADD CONSTRAINT "ArticuloAtributoValor_atributoValorId_fkey" FOREIGN KEY ("atributoValorId") REFERENCES "CategoriaAtributoValor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticuloImagen" ADD CONSTRAINT "ArticuloImagen_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticuloOferta" ADD CONSTRAINT "ArticuloOferta_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
