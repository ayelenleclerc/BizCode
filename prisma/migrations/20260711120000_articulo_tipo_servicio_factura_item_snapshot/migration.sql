-- #244: Articulo.tipo / unidadServicio + line snapshots; nullable articuloId on FacturaItem/PedidoItem

-- AlterTable Articulo
ALTER TABLE "Articulo" ADD COLUMN "tipo" VARCHAR(10) NOT NULL DEFAULT 'articulo';
ALTER TABLE "Articulo" ADD COLUMN "unidadServicio" VARCHAR(12);

CREATE INDEX "Articulo_tenantId_tipo_idx" ON "Articulo"("tenantId", "tipo");

-- AlterTable FacturaItem: snapshots + nullable articuloId
ALTER TABLE "FacturaItem" ADD COLUMN "descripcion" VARCHAR(120) NOT NULL DEFAULT '';
ALTER TABLE "FacturaItem" ADD COLUMN "condIva" VARCHAR(1) NOT NULL DEFAULT '1';
ALTER TABLE "FacturaItem" ADD COLUMN "unidadServicio" VARCHAR(12);

-- Backfill snapshots from Articulo before dropping NOT NULL on articuloId
UPDATE "FacturaItem" fi
SET
  "descripcion" = LEFT(a."descripcion", 120),
  "condIva" = a."condIva"
FROM "Articulo" a
WHERE fi."articuloId" = a."id";

ALTER TABLE "FacturaItem" DROP CONSTRAINT "FacturaItem_articuloId_fkey";
ALTER TABLE "FacturaItem" ALTER COLUMN "articuloId" DROP NOT NULL;
ALTER TABLE "FacturaItem" ADD CONSTRAINT "FacturaItem_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable PedidoItem: snapshots + nullable articuloId
ALTER TABLE "PedidoItem" ADD COLUMN "descripcion" VARCHAR(120) NOT NULL DEFAULT '';
ALTER TABLE "PedidoItem" ADD COLUMN "condIva" VARCHAR(1) NOT NULL DEFAULT '1';
ALTER TABLE "PedidoItem" ADD COLUMN "unidadServicio" VARCHAR(12);

UPDATE "PedidoItem" pi
SET
  "descripcion" = LEFT(a."descripcion", 120),
  "condIva" = a."condIva"
FROM "Articulo" a
WHERE pi."articuloId" = a."id";

ALTER TABLE "PedidoItem" DROP CONSTRAINT "PedidoItem_articuloId_fkey";
ALTER TABLE "PedidoItem" ALTER COLUMN "articuloId" DROP NOT NULL;
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
