-- Incident response: tenant maintenance mode (#222)
ALTER TABLE "Tenant" ADD COLUMN "maintenanceMode" BOOLEAN NOT NULL DEFAULT false;
