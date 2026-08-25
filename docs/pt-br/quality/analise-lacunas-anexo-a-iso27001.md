# ISO/IEC 27001:2022 Anexo A — análise de lacunas inicial (#196)

**Papel do documento:** Análise de lacunas canônica para preparação do SGSI BizCode (ISO-ready).  
**Referência normativa:** ISO/IEC 27001:2022 Anexo A (93 controles).  
**Regra de evidência:** O status baseia-se apenas em evidência do repositório (código, CI, docs). Sem afirmar certificação.

| Campo | Valor |
|-------|--------|
| Issue relacionado | [#196](https://github.com/ayelenleclerc/BizCode/issues/196) |
| Stub SoA | [SEC-002](../certificacion-iso/sec/sec-002-declaracao-aplicabilidade-soa.md) |
| Registro de riscos | [RSK-002](../certificacion-iso/rsk/rsk-002-registro-riscos.md) |
| Plano de tratamento | [RSK-004](../certificacion-iso/rsk/rsk-004-plano-tratamento-riscos.md) |
| Data da análise | 2026-08-25 |

## Legenda de status

| Status | Significado |
|--------|-------------|
| Implemented | Intenção do controle atendida com evidência verificável no repo |
| Partial | Evidência parcial; lacunas restantes |
| Not evidenced | Sem evidência adequada no repositório |
| N/A | Fora do escopo SGSI de produto atual (justificado) |

## Escopo SGSI (produto)

No escopo: aplicativo BizCode (web, API, desktop, mobile documentados), controles de engenharia em CI/scripts, procedimentos em `docs/`.

Fora / operador: físicos A.7, RH formal A.6, relatório de pentest externo (#194), SLA/drill DR (#197).

## Resumo de contagens (inicial)

| Status | Aprox. |
|--------|--------|
| Implemented | 0 |
| Partial | 53 |
| Not evidenced | 26 |
| N/A | 14 |
| **Total** | **93** |

Contagem indicativa (conservadora: evidência de produto é majoritariamente **Partial**).

---

## A.5 Controles organizacionais

| Controle | Título (curto) | Status | Evidência / lacuna |
|----------|----------------|--------|-------------------|
| A.5.1 | Políticas de segurança da informação | Partial | [seguranca.md](../seguranca.md); política ISMS no #196 |
| A.5.2 | Papéis e responsabilidades | Partial | [matriz RBAC](matriz-rbac-funcoes-permissoes-scopes.md), [modelo IAM](modelo-iam-sessoes-auditoria.md) |
| A.5.3 | Segregação de funções | Partial | Separação RBAC; sem matriz SoD formal |
| A.5.4 | Responsabilidades da direção | Not evidenced | Sem registro de compromisso no repo |
| A.5.5 | Contato com autoridades | Not evidenced | Sem registro |
| A.5.6 | Contato com grupos de interesse | Not evidenced | Sem registro |
| A.5.7 | Inteligência de ameaças | Partial | STRIDE/OWASP em [seguranca.md](../seguranca.md) |
| A.5.8 | Segurança na gestão de projetos | Partial | DoR/DoD no [plano mestre](execucao-plano-mestre-bizcode.md) |
| A.5.9 | Inventário de informação e ativos | Partial | [mapa-dados-pessoais.md](../mapa-dados-pessoais.md); SEC-003 stub |
| A.5.10 | Uso aceitável | Not evidenced | Sem política AUP |
| A.5.11 | Devolução de ativos | N/A | Corporativo |
| A.5.12 | Classificação da informação | Partial | Classes de privacidade; esquema incompleto |
| A.5.13 | Rotulagem | Not evidenced | Sem esquema |
| A.5.14 | Transferência de informação | Partial | TLS; canais documentados parciais |
| A.5.15 | Controle de acesso | Partial | RBAC + `requirePermission` |
| A.5.16 | Gestão de identidades | Partial | [modelo IAM](modelo-iam-sessoes-auditoria.md) |
| A.5.17 | Informação de autenticação | Partial | Hash de senhas; segredos em env |
| A.5.18 | Direitos de acesso | Partial | Gestão de usuários + RBAC |
| A.5.19 | Segurança em relações com fornecedores | Partial | Template SEC-013; sem linhas |
| A.5.20 | Segurança em acordos com fornecedores | Not evidenced | Sem cláusulas arquivadas |
| A.5.21 | Cadeia de suprimentos TIC | Partial | `pnpm audit`, Snyk |
| A.5.22 | Monitoramento de serviços de fornecedor | Not evidenced | Sem cadência |
| A.5.23 | Uso de serviços em nuvem | Partial | Ambientes de implantação; Doppler; Cloudflare |
| A.5.24 | Planejamento de gestão de incidentes | Partial | [resposta-a-incidentes.md](resposta-a-incidentes.md) |
| A.5.25 | Avaliação de eventos de segurança | Partial | [monitoramento-de-seguranca.md](monitoramento-de-seguranca.md) |
| A.5.26 | Resposta a incidentes | Partial | Runbooks; registro SEC-009 stub |
| A.5.27 | Aprendizado com incidentes | Partial | Post-mortem documentado |
| A.5.28 | Coleta de evidência | Partial | Audit events / forense |
| A.5.29 | Segurança durante disrupção | Not evidenced | [#197](https://github.com/ayelenleclerc/BizCode/issues/197) |
| A.5.30 | Continuidade TIC | Not evidenced | #197; SEC-014/015 |
| A.5.31 | Requisitos legais e contratuais | Partial | Privacidade #195; ADR-0007 |
| A.5.32 | Direitos de propriedade intelectual | Not evidenced | Sem política IP |
| A.5.33 | Proteção de registros | Partial | Auditoria / templates ISO |
| A.5.34 | Privacidade e PII | Partial | Guia de privacidade #195 |
| A.5.35 | Revisão independente | Not evidenced | Registro pentest vazio; #194 |
| A.5.36 | Conformidade com políticas e normas | Partial | CI Quality Gate, docs-map |
| A.5.37 | Procedimentos operacionais documentados | Partial | Backup, deploy, incidentes |

## A.6 Controles de pessoas

| Controle | Título (curto) | Status | Evidência / lacuna |
|----------|----------------|--------|-------------------|
| A.6.1 | Triagem | N/A | RH corporativo |
| A.6.2 | Termos de emprego | N/A | RH |
| A.6.3 | Conscientização e treinamento | Not evidenced | Stubs HR vazios |
| A.6.4 | Processo disciplinar | N/A | RH |
| A.6.5 | Após término ou mudança de emprego | Partial | Revogação de sessões documentada |
| A.6.6 | Acordos de confidencialidade | N/A | Jurídico corporativo |
| A.6.7 | Trabalho remoto | Not evidenced | Sem política |
| A.6.8 | Relato de eventos | Partial | Monitoramento + resposta a incidentes |

## A.7 Controles físicos

Todos **N/A** no escopo SaaS/desktop atual (segurança física de hosting/escritório = operador/provedor).

| Controle | Título (curto) | Status | Evidência / lacuna |
|----------|----------------|--------|-------------------|
| A.7.1 | Perímetros de segurança física | N/A | Operador/provedor |
| A.7.2 | Entrada física | N/A | Operador/provedor |
| A.7.3 | Escritórios, salas e instalações | N/A | Operador/provedor |
| A.7.4 | Monitoramento de segurança física | N/A | Operador/provedor |
| A.7.5 | Ameaças físicas e ambientais | N/A | Operador/provedor |
| A.7.6 | Trabalho em áreas seguras | N/A | Operador/provedor |
| A.7.7 | Mesa e tela limpas | N/A | Política corporativa / endpoint |
| A.7.8 | Localização e proteção de equipamentos | N/A | Operador/provedor |
| A.7.9 | Ativos fora das instalações | N/A | Corporativo / dispositivos do cliente |
| A.7.10 | Mídia de armazenamento | N/A | Operador (exceto artefatos de backup cifrados — A.8.13) |
| A.7.11 | Utilidades de suporte | N/A | Operador/provedor |
| A.7.12 | Segurança de cabeamento | N/A | Operador/provedor |
| A.7.13 | Manutenção de equipamentos | N/A | Operador/provedor |
| A.7.14 | Descarte ou reutilização segura | N/A | Operador/provedor |

## A.8 Controles tecnológicos

| Controle | Título (curto) | Status | Evidência / lacuna |
|----------|----------------|--------|-------------------|
| A.8.1 | Dispositivos endpoint | Partial | Hardening mobile #220; allowlist Tauri |
| A.8.2 | Acesso privilegiado | Partial | SuperAdmin; SEC-006 stub |
| A.8.3 | Restrição de acesso à informação | Partial | Permissões + tenant; IDOR foco #194 |
| A.8.4 | Acesso ao código-fonte | Partial | Permissões GitHub org |
| A.8.5 | Autenticação segura | Partial | Sessão + hash |
| A.8.6 | Gestão de capacidade | Not evidenced | Sem plano |
| A.8.7 | Proteção contra malware | Not evidenced | Operador/cliente |
| A.8.8 | Vulnerabilidades técnicas | Partial | SEC-010; audit/Snyk/ZAP |
| A.8.9 | Gestão de configuração | Partial | Env, Docker, workflows |
| A.8.10 | Exclusão de informação | Partial | Direitos do titular; exclusão parcial |
| A.8.11 | Mascaramento de dados | Not evidenced | Sem framework |
| A.8.12 | Prevenção de vazamento de dados | Partial | Redação de logs |
| A.8.13 | Backup de informação | Partial | Backup/restore #150 |
| A.8.14 | Redundância | Not evidenced | #197 |
| A.8.15 | Registro (logging) | Partial | Observabilidade + eventos |
| A.8.16 | Monitoramento | Partial | Monitoramento de segurança |
| A.8.17 | Sincronização de relógio | Not evidenced | NTP do host não documentado |
| A.8.18 | Utilitários privilegiados | Not evidenced | Sem controle documentado |
| A.8.19 | Instalação de software em operação | Partial | Imagens CI/GHCR |
| A.8.20 | Segurança de redes | Partial | Helmet/CORS; Cloudflare |
| A.8.21 | Serviços de rede | Partial | TLS hosted; loopback desktop |
| A.8.22 | Segregação de redes | Partial | Staging vs produção #152 |
| A.8.23 | Filtragem web | N/A | Não é controle de produto |
| A.8.24 | Criptografia | Partial | TLS; backups cifrados; tokens |
| A.8.25 | Ciclo de vida de desenvolvimento seguro | Partial | Tests, lint, PR para `develop` |
| A.8.26 | Requisitos de segurança de aplicações | Partial | OpenAPI, a11y, headers |
| A.8.27 | Arquitetura e engenharia seguras | Partial | ADR-0007; multi-tenant |
| A.8.28 | Codificação segura | Partial | TS estrito; `check:raw-sql` |
| A.8.29 | Testes de segurança | Partial | ZAP; pentest externo pendente |
| A.8.30 | Desenvolvimento terceirizado | Not evidenced | Sem procedimento |
| A.8.31 | Separação de ambientes | Partial | Ambientes de implantação |
| A.8.32 | Gestão de mudanças | Partial | PR + CI |
| A.8.33 | Informação de teste | Partial | Fixtures/seeds |
| A.8.34 | Proteção durante testes de auditoria | Partial | ZAP efêmero/staging; sem dados cliente prod |

## Temas prioritários de lacuna

1. Revisão de segurança independente externa (#194).
2. Aprovação formal da política ISMS e RACI.
3. Continuidade / drill DR e SLA (#197).
4. Inventário e classificação de ativos (SEC-003).
5. Cláusulas de fornecedores + SEC-013.
6. Treinamento de conscientização (RH).
7. Capacidade / redundância / relógio para ops hosted.

## Outros idiomas

- English: [iso27001-annex-a-gap-analysis.md](../../en/quality/iso27001-annex-a-gap-analysis.md)
- Español: [analisis-brechas-anexo-a-iso27001.md](../../es/quality/analisis-brechas-anexo-a-iso27001.md)

## Histórico de revisões

| Versão | Data | Autor | Resumo |
|--------|------|-------|--------|
| 0.1 | 2026-08-25 | BizCode | Gap Anexo A inicial #196 |
