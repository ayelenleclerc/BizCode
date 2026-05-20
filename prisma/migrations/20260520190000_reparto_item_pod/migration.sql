-- AlterTable
ALTER TABLE "RepartoItem" ADD COLUMN "receptorNombre" VARCHAR(120),
ADD COLUMN "receptorDni" VARCHAR(20),
ADD COLUMN "notasEntrega" VARCHAR(500),
ADD COLUMN "podMedia" JSONB;

-- Shrink motivoNoEntrega to enum-sized column (values validated in app)
ALTER TABLE "RepartoItem" ALTER COLUMN "motivoNoEntrega" TYPE VARCHAR(30);
