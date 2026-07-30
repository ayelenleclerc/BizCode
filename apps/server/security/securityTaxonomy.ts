/**
 * @en Security event taxonomy and classification helpers for monitoring (#221).
 * @es Taxonomía de eventos de seguridad y helpers de clasificación (#221).
 * @pt-BR Taxonomia de eventos de segurança e helpers de classificação (#221).
 */

export const SECURITY_EVENT_TYPES = [
  'brute_force_login',
  'login_geo_anomaly',
  'role_escalation',
  'mfa_disabled_critical',
  'forbidden_burst',
  'user_privileged_create',
  'tenant_incident_action',
  'info_login_success',
] as const

export type SecurityEventType = (typeof SECURITY_EVENT_TYPES)[number]

export const SECURITY_SEVERITIES = ['critical', 'high', 'info'] as const

export type SecuritySeverity = (typeof SECURITY_SEVERITIES)[number]

export type AuditClassification = {
  securityEventType: SecurityEventType | null
  severity: SecuritySeverity | null
}

const PRIVILEGED_ROLES = new Set(['owner', 'manager', 'super_admin'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

/**
 * @en Classifies an audit action + metadata into security taxonomy (#221).
 * @es Clasifica action + metadata de audit en la taxonomía de seguridad (#221).
 * @pt-BR Classifica action + metadata de audit na taxonomia de segurança (#221).
 */
export function classifyAuditEvent(
  action: string,
  metadata?: unknown,
): AuditClassification {
  const meta = isRecord(metadata) ? metadata : {}

  if (action === 'login' || action === 'mfa_verify') {
    if (meta.geoAnomaly === true) {
      return { securityEventType: 'login_geo_anomaly', severity: 'critical' }
    }
    return { securityEventType: 'info_login_success', severity: 'info' }
  }

  if (action === 'user_create') {
    const role = asString(meta.role)
    if (role && PRIVILEGED_ROLES.has(role)) {
      return { securityEventType: 'user_privileged_create', severity: 'high' }
    }
    return { securityEventType: null, severity: null }
  }

  if (action === 'user_update') {
    const role = asString(meta.role)
    const previousRole = asString(meta.previousRole)
    if (role && PRIVILEGED_ROLES.has(role) && role !== previousRole) {
      return { securityEventType: 'role_escalation', severity: 'critical' }
    }
    return { securityEventType: null, severity: null }
  }

  if (action === 'mfa_disable' || action === 'mfa_admin_disable') {
    const role = asString(meta.role)
    if (role && PRIVILEGED_ROLES.has(role)) {
      return { securityEventType: 'mfa_disabled_critical', severity: 'critical' }
    }
    return { securityEventType: null, severity: null }
  }

  if (
    action === 'incident_disable_tenant'
    || action === 'incident_maintenance_on'
    || action === 'incident_maintenance_off'
    || action === 'incident_revoke_sessions'
  ) {
    return { securityEventType: 'tenant_incident_action', severity: 'info' }
  }

  if (action === 'forbidden_burst') {
    return { securityEventType: 'forbidden_burst', severity: 'critical' }
  }

  if (action === 'brute_force_login') {
    return { securityEventType: 'brute_force_login', severity: 'critical' }
  }

  return { securityEventType: null, severity: null }
}

export function isPrivilegedRole(role: string): boolean {
  return PRIVILEGED_ROLES.has(role)
}
