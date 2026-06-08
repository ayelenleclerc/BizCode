-- AlterTable: supplier catalog snapshot on purchase order lines (#323)
ALTER TABLE "OrdenCompraItem" ADD COLUMN "codigoProveedor" VARCHAR(50);
ALTER TABLE "OrdenCompraItem" ADD COLUMN "descripcionProveedor" VARCHAR(120);
