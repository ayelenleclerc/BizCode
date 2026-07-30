/**
 * @en Security monitoring poller: evaluates rules every 60s without blocking HTTP (#221).
 * @es Poller de monitoreo de seguridad: evalúa reglas cada 60s sin bloquear HTTP (#221).
 * @pt-BR Poller de monitoramento de segurança: avalia regras a cada 60s sem bloquear HTTP (#221).
 */

import type { PrismaClient } from '@prisma/client'
import { writeAuditEvent } from '../audit'
import { logger } from '../logger'
import { drainForbiddenBursts } from './forbiddenBurstCounter'
import { tryClaimSecurityAlert } from './securityAlertDedupe'
import { dispatchSecurityAlert } from './securityAlertDispatch'
import type { SecurityEventType, SecuritySeverity } from './securityTaxonomy'

export const SECURITY_MONITOR_CURSOR_ID = 'default'
export const SECURITY_MONITOR_INTERVAL_MS = 60_000
const BRUTE_FORCE_LOOKBACK_MS = 15 * 60 * 1000
/** Aligns with login lockout threshold in auth.ts (`LOGIN_MAX_FAILURES`). */
const BRUTE_FORCE_THRESHOLD = 5

let timer: ReturnType<typeof setInterval> | null = null
let running = false

type ClassifiedAuditRow = {
  id: number
  tenantId: number
  action: string
  resource: string
  resourceId: string | null
  ipAddress: string | null
  securityEventType: string | null
  severity: string | null
  metadata: unknown
}

function isAlertableSeverity(severity: string | null): severity is SecuritySeverity {
  return severity === 'critical' || severity === 'high'
}

function isSecurityEventType(value: string | null): value is SecurityEventType {
  return (
    value === 'brute_force_login'
    || value === 'login_geo_anomaly'
    || value === 'role_escalation'
    || value === 'mfa_disabled_critical'
    || value === 'forbidden_burst'
    || value === 'user_privileged_create'
    || value === 'tenant_incident_action'
    || value === 'info_login_success'
  )
}

function metadataUsername(metadata: unknown): string | undefined {
  if (typeof metadata !== 'object' || metadata === null) return undefined
  const username = (metadata as Record<string, unknown>).username
  return typeof username === 'string' ? username : undefined
}

/**
 * @en Detects brute-force patterns from LoginAttempt and writes classified audit events.
 * @es Detecta fuerza bruta desde LoginAttempt y escribe audit clasificado.
 * @pt-BR Detecta força bruta a partir de LoginAttempt e grava audit classificado.
 */
export async function detectBruteForceLogins(prisma: PrismaClient): Promise<number> {
  const since = new Date(Date.now() - BRUTE_FORCE_LOOKBACK_MS)
  const failures = await prisma.loginAttempt.findMany({
    where: { success: false, createdAt: { gte: since } },
    select: { tenantId: true, username: true, ipAddress: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 2000,
  })

  const counts = new Map<string, { tenantId: number; username: string; ipAddress: string | null; count: number }>()
  for (const row of failures) {
    const key = `${row.tenantId}:${row.username.toLowerCase()}`
    const current = counts.get(key)
    if (current) {
      current.count += 1
    } else {
      counts.set(key, {
        tenantId: row.tenantId,
        username: row.username,
        ipAddress: row.ipAddress,
        count: 1,
      })
    }
  }

  let fired = 0
  for (const hit of counts.values()) {
    if (hit.count < BRUTE_FORCE_THRESHOLD) continue
    const ruleKey = 'brute_force_login'
    const subjectKey = `${hit.tenantId}:${hit.username.toLowerCase()}`
    const claimed = await tryClaimSecurityAlert(prisma, ruleKey, subjectKey)
    if (!claimed) continue
    await writeAuditEvent({
      prisma,
      tenantId: hit.tenantId,
      action: 'brute_force_login',
      resource: 'login_attempt',
      resourceId: hit.username,
      ipAddress: hit.ipAddress,
      metadata: { username: hit.username, failureCount: hit.count },
      securityEventType: 'brute_force_login',
      severity: 'critical',
    })
    await dispatchSecurityAlert(prisma, {
      tenantId: hit.tenantId,
      securityEventType: 'brute_force_login',
      severity: 'critical',
      action: 'brute_force_login',
      resource: 'login_attempt',
      resourceId: hit.username,
      ipAddress: hit.ipAddress,
      username: hit.username,
      detail: `${hit.count} failed login attempts within lookback window`,
    })
    fired += 1
  }
  return fired
}

/**
 * @en Flushes in-memory 403 bursts into audit + alerts.
 * @es Vuelca ráfagas 403 en memoria a audit + alertas.
 * @pt-BR Descarrega rajadas 403 em memória para audit + alertas.
 */
export async function processForbiddenBursts(prisma: PrismaClient): Promise<number> {
  const bursts = drainForbiddenBursts()
  let fired = 0
  for (const burst of bursts) {
    const ruleKey = 'forbidden_burst'
    const subjectKey = burst.ipAddress
    const claimed = await tryClaimSecurityAlert(prisma, ruleKey, subjectKey)
    if (!claimed) continue
    // Platform tenant id 1 is conventional; use first tenant as fallback for audit FK.
    const platform = await prisma.tenant.findFirst({
      where: { slug: 'platform' },
      select: { id: true },
    })
    const tenantId = platform?.id ?? 1
    await writeAuditEvent({
      prisma,
      tenantId,
      action: 'forbidden_burst',
      resource: 'http',
      resourceId: burst.ipAddress,
      ipAddress: burst.ipAddress,
      metadata: { count: burst.count },
      securityEventType: 'forbidden_burst',
      severity: 'critical',
    })
    await dispatchSecurityAlert(prisma, {
      tenantId,
      securityEventType: 'forbidden_burst',
      severity: 'critical',
      action: 'forbidden_burst',
      resource: 'http',
      resourceId: burst.ipAddress,
      ipAddress: burst.ipAddress,
      detail: `${burst.count} HTTP 403 responses within 60s`,
    })
    fired += 1
  }
  return fired
}

/**
 * @en Processes newly classified audit events since the watermark and alerts on critical/high.
 * @es Procesa audit clasificado nuevo desde el watermark y alerta critical/high.
 * @pt-BR Processa audit classificado novo desde a marca d'água e alerta critical/high.
 */
export async function processClassifiedAuditEvents(prisma: PrismaClient): Promise<number> {
  const cursor = await prisma.securityMonitorCursor.findUnique({
    where: { id: SECURITY_MONITOR_CURSOR_ID },
  })
  const lastId = cursor?.lastAuditEventId ?? 0

  const rows = (await prisma.auditEvent.findMany({
    where: {
      id: { gt: lastId },
      OR: [
        { severity: { in: ['critical', 'high'] } },
        { securityEventType: { not: null } },
      ],
    },
    orderBy: { id: 'asc' },
    take: 200,
    select: {
      id: true,
      tenantId: true,
      action: true,
      resource: true,
      resourceId: true,
      ipAddress: true,
      securityEventType: true,
      severity: true,
      metadata: true,
    },
  })) as ClassifiedAuditRow[]

  let maxId = lastId
  let fired = 0
  for (const row of rows) {
    maxId = Math.max(maxId, row.id)
    if (!isAlertableSeverity(row.severity) || !isSecurityEventType(row.securityEventType)) {
      continue
    }
    // Brute force / forbidden already alerted at detection time.
    if (row.securityEventType === 'brute_force_login' || row.securityEventType === 'forbidden_burst') {
      continue
    }
    const ruleKey = row.securityEventType
    const subjectKey = `${row.tenantId}:${row.action}:${row.resourceId ?? row.id}`
    const claimed = await tryClaimSecurityAlert(prisma, ruleKey, subjectKey)
    if (!claimed) continue
    await dispatchSecurityAlert(prisma, {
      tenantId: row.tenantId,
      securityEventType: row.securityEventType,
      severity: row.severity,
      action: row.action,
      resource: row.resource,
      resourceId: row.resourceId,
      ipAddress: row.ipAddress,
      username: metadataUsername(row.metadata),
    })
    fired += 1
  }

  if (maxId > lastId) {
    await prisma.securityMonitorCursor.upsert({
      where: { id: SECURITY_MONITOR_CURSOR_ID },
      create: { id: SECURITY_MONITOR_CURSOR_ID, lastAuditEventId: maxId },
      update: { lastAuditEventId: maxId },
    })
  }

  return fired
}

/**
 * @en One monitor tick (exported for tests).
 * @es Un tick del monitor (exportado para tests).
 * @pt-BR Um tick do monitor (exportado para testes).
 */
export async function runSecurityMonitorTick(prisma: PrismaClient): Promise<void> {
  if (running) return
  running = true
  try {
    await processForbiddenBursts(prisma)
    await detectBruteForceLogins(prisma)
    await processClassifiedAuditEvents(prisma)
  } catch (err) {
    logger.warn(
      { err: err instanceof Error ? { name: err.name, message: err.message } : String(err) },
      '[security] monitor tick failed',
    )
  } finally {
    running = false
  }
}

/**
 * @en Starts the 60s security monitor. No-op in test unless BIZCODE_SECURITY_MONITOR=true.
 * @es Arranca el monitor 60s. No-op en test salvo BIZCODE_SECURITY_MONITOR=true.
 * @pt-BR Inicia o monitor 60s. No-op em test salvo BIZCODE_SECURITY_MONITOR=true.
 */
export function startSecurityMonitor(prisma: PrismaClient): void {
  if (timer) return
  const enabledExplicitly = process.env.BIZCODE_SECURITY_MONITOR === 'true'
  const disabledExplicitly = process.env.BIZCODE_SECURITY_MONITOR === 'false'
  if (disabledExplicitly) return
  if (process.env.NODE_ENV === 'test' && !enabledExplicitly) return

  const tick = () => {
    void runSecurityMonitorTick(prisma)
  }
  timer = setInterval(tick, SECURITY_MONITOR_INTERVAL_MS)
  // Avoid keeping the process alive solely due to the monitor in some runtimes.
  if (typeof timer === 'object' && timer !== null && 'unref' in timer) {
    timer.unref()
  }
  logger.info({ intervalMs: SECURITY_MONITOR_INTERVAL_MS }, '[security] monitor started')
}

/**
 * @en Stops the security monitor interval.
 * @es Detiene el intervalo del monitor de seguridad.
 * @pt-BR Para o intervalo do monitor de segurança.
 */
export function stopSecurityMonitor(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}
