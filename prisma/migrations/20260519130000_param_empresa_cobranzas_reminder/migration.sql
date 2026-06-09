-- AlterTable
ALTER TABLE "ParamEmpresa" ADD COLUMN "timezone" VARCHAR(64) NOT NULL DEFAULT 'America/Argentina/Buenos_Aires';
ALTER TABLE "ParamEmpresa" ADD COLUMN "recordatorioHoraInicio" INTEGER NOT NULL DEFAULT 8;
ALTER TABLE "ParamEmpresa" ADD COLUMN "recordatorioHoraFin" INTEGER NOT NULL DEFAULT 18;
