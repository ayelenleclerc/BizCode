-- AlterTable: explicit dispatch timestamp for logistics KPIs (#145 / ADR-0011)
ALTER TABLE "OrdenEntrega" ADD COLUMN "dispatchedAt" TIMESTAMP(3),
ADD COLUMN "dispatchTimestampSource" VARCHAR(20);

-- Backfill from audit when OE reached in_transit
UPDATE "OrdenEntrega" oe
SET
  "dispatchedAt" = sub."createdAt",
  "dispatchTimestampSource" = 'event'
FROM (
  SELECT DISTINCT ON (ae."resourceId")
    ae."resourceId",
    ae."createdAt"
  FROM "AuditEvent" ae
  WHERE ae.action = 'orden_entrega_in_transit'
    AND ae."resourceId" ~ '^[0-9]+$'
  ORDER BY ae."resourceId", ae."createdAt" ASC
) sub
WHERE oe.id = (sub."resourceId")::integer
  AND oe.estado IN ('in_transit', 'delivered', 'failed')
  AND oe."dispatchedAt" IS NULL;

-- Estimated fallback for rows without audit
UPDATE "OrdenEntrega"
SET
  "dispatchedAt" = "updatedAt",
  "dispatchTimestampSource" = 'estimated'
WHERE estado IN ('in_transit', 'delivered', 'failed')
  AND "dispatchedAt" IS NULL;

CREATE INDEX "OrdenEntrega_tenantId_dispatchedAt_idx" ON "OrdenEntrega"("tenantId", "dispatchedAt");
