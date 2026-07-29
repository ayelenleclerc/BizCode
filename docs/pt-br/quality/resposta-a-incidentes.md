# Resposta a incidentes de segurança (#222)

## Propósito

Runbook operacional para incidentes de segurança no BizCode (desktop, API SaaS ou dados de tenant). Complementa o stub ISO [SEC-008](../certificacion-iso/sec/sec-008-gestao-incidentes.md) com ações evidenciadas no produto.

**Status de evidência:** Ferramentas de revogação de sessões, desabilitação de tenant e modo manutenção estão no painel super-admin e na API. Documento **ISO-ready**; não afirma certificação.

## 1. Classificação de incidentes

| Severidade | Exemplos | Tempo de resposta inicial |
|------------|----------|---------------------------|
| **Crítico** | Breach de dados de clientes; acesso não autorizado como `super_admin`; exfiltração em massa | Imediato (minutos) |
| **Alto** | Exposição de credenciais; DB acessível publicamente; roubo generalizado de tokens | Em até 1 hora |
| **Médio** | Compromisso de sessão de um usuário; MFA desabilitado em conta privilegiada sem aprovação | No mesmo dia útil |
| **Baixo** | Tentativas falhas de intrusão; brute force bloqueado sem login bem-sucedido | Registro e revisão de tendências |

## 2. Runbooks

### 2.1 Compromisso de credenciais / sessões

1. Identificar usuários ou tenant afetados via audit log / export forense.
2. **Revogar sessões:** SuperAdmin → detalhe do tenant → *Revogar todas as sessões*, ou `POST /api/superadmin/tenants/{tenantId}/revoke-all-sessions`.
3. Forçar troca de senha; reativar MFA se foi desabilitado.
4. Rotacionar segredos expostos (Doppler / env) conforme [gestão de segredos](gestao-segredos-e-doppler.md).
5. Notificar o owner do tenant; registrar ações na auditoria.

### 2.2 Compromisso ou abuso ativo do tenant

1. **Modo manutenção** (bloqueia login/API dos usuários do tenant; o `super_admin` da plataforma continua gerenciando): `POST /api/superadmin/tenants/{tenantId}/maintenance` com `{ "enabled": true }` (também revoga sessões).
2. Se for necessário isolamento maior: **Desabilitar tenant** via UI ou `POST /api/superadmin/tenants/{tenantId}/disable`. Reativar com `PATCH ... { "active": true }` quando apropriado.
3. Export forense: `GET /api/superadmin/tenants/{tenantId}/audit-events?startDate=&endDate=`.
4. Preservar logs; não apagar linhas de auditoria.

### 2.3 Banco de dados ou infraestrutura exposta

1. Fechar exposição de rede (firewall / security groups / Cloudflare).
2. Rotacionar `DATABASE_URL` e credenciais relacionadas.
3. Avaliar dados acessados; seguir notificação legal se houver dados pessoais (§4).
4. Post-mortem (§5).

## 3. Ferramentas de resposta (produto)

| Ação | UI | API |
|------|----|-----|
| Revogar sessões do tenant | Detalhe tenant | `POST /api/superadmin/tenants/{tenantId}/revoke-all-sessions` |
| Desabilitar tenant | Detalhe / Suspender | `POST /api/superadmin/tenants/{tenantId}/disable` |
| Modo manutenção | Detalhe tenant | `POST /api/superadmin/tenants/{tenantId}/maintenance` |
| Listagem forense de auditoria | Export no detalhe | `GET /api/superadmin/tenants/{tenantId}/audit-events` |

**Manutenção vs desabilitar:** A manutenção mantém o tenant ativo para operadores, mas bloqueia auth/API de usuários finais. Desabilitar (`active=false`) rejeita login até a reativação.

**Fora de escopo da manutenção:** Jobs em background do tenant não são pausados automaticamente; interrompê-los manualmente se o incidente exigir.

## 4. Notificações legais (Argentina)

Sob a **Lei 25.326** e critérios da **AAIP**, avaliar se um breach de dados pessoais exige notificação à Agência e aos titulares. Meta: avaliação em até **72 horas** após o conhecimento confirmado. Usar assessoria jurídica; não inventar texto normativo na UI.

Conteúdo sugerido: natureza do incidente, categorias de dados, volume aproximado, medidas tomadas, contato.

Referência: [AAIP](https://www.argentina.gob.ar/aaip).

## 5. Modelo de post-mortem

| Campo | Conteúdo |
|-------|----------|
| Título / ID | |
| Severidade | Crítico / Alto / Médio / Baixo |
| Cronologia | Detecção → contenção → erradicação → recuperação |
| Causa raiz | |
| Impacto | Tenants, usuários, categorias de dados |
| O que funcionou | |
| O que melhorar | |
| Ações corretivas | Responsável, prazo |
| Links | Export de auditoria, PRs, tickets |

## Referências

- Issue #222
- [SEC-008 Gestão de incidentes](../certificacion-iso/sec/sec-008-gestao-incidentes.md)
- [Segurança](../seguranca.md)
- OpenAPI: `docs/api/openapi.yaml`
