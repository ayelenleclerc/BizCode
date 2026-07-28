# Security Audit Checklist

## Pre-launch Security Audit

### Authentication & Authorization
- [ ] Password hashing (bcrypt/scrypt/argon2)
- [ ] JWT token validation
- [ ] Session management
- [ ] RBAC implementation
- [ ] OAuth2 flow security

### Input Validation
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] CSRF tokens
- [ ] File upload validation
- [ ] API input sanitization

### Data Protection
- [ ] Encryption at rest (AES-256)
- [ ] Encryption in transit (TLS 1.3)
- [ ] PII handling compliance
- [ ] Database access controls
- [x] Secret management (env vars, Doppler inject / vault-equivalent; Gitleaks CI) — #216 / ADR-0015

### API Security
- [ ] Rate limiting
- [ ] API key rotation
- [ ] CORS configuration
- [ ] Request size limits
- [ ] Error message sanitization

### Infrastructure
- [ ] Container security scanning
- [ ] Dependency vulnerability scanning
- [ ] Network segmentation
- [ ] Logging & monitoring
- [ ] Backup & recovery procedures

### Compliance
- [ ] Data retention policies
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Incident response plan
- [ ] Security contact

## Pentest Scope
- Authentication flows
- Billing/payment endpoints
- Data export/import
- Admin panel
- API endpoints
