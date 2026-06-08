-- Rename billing.afip_cae module key to billing.arca_cae (ARCA branding).

UPDATE "TenantConfig"
SET "modules" = array_replace("modules", 'billing.afip_cae', 'billing.arca_cae')
WHERE 'billing.afip_cae' = ANY ("modules");

UPDATE "TenantModuleTrial"
SET "moduleKey" = 'billing.arca_cae'
WHERE "moduleKey" = 'billing.afip_cae';
