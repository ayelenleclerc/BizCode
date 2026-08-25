# Plano de tratamento de riscos

| Código do documento | RSK-004 |
| Versão | 0.2 |
| Data | 2026-08-25 |
| Autor | BizCode |
| Nível de requisito | Obrigatório |
| Aplicabilidade normativa | ISO 9001:2015; ISO/IEC 27001:2022; ISO/IEC 20000-1:2018; ISO/IEC 42001:2023 |
| Estado de evidência | Parcial — plano de ação inicial #196 |

## Declaração de fora de escopo

Plano ISO-ready. Não afirma certificação nem garante datas de fornecedores externos.

## Propósito

Definir ações para reduzir riscos de [RSK-002](rsk-002-registro-riscos.md), com donos, janelas-alvo e issues vinculados.

## Opções de tratamento

Mitigar · Aceitar · Transferir · Evitar (por linha).

## Plano de ação

| ID risco | Tratamento | Ação | Dono | Alvo | Link |
|----------|------------|------|------|------|------|
| R-01 | Mitigar | Manter IDOR/tenant no escopo do pentest; remediar Critical/High | Engenharia | Após relatório #194 | [#194](https://github.com/ayelenleclerc/BizCode/issues/194) |
| R-02 | Mitigar | Manter `check:logs` / redação; revisar sinks de produção | Engenharia + Ops | Antes do lançamento comercial | Política de sanitização de logs |
| R-03 | Mitigar | Manter `pnpm audit` High+ bloqueante; triagem #219 | Engenharia | Contínuo | Varredura de dependências |
| R-04 | Mitigar | Contratar pentest externo; arquivar relatório | Product owner | Antes do lançamento comercial | [#194](https://github.com/ayelenleclerc/BizCode/issues/194) |
| R-05 | Mitigar | Smoke local feito (SEC-015); executar drill staging; registrar RTO | Ops plataforma | Host staging pronto | [#197](https://github.com/ayelenleclerc/BizCode/issues/197) |
| R-06 | Mitigar | Seguir guards de ambientes; não apontar tools de staging para prod | Ops plataforma | Contínuo | Docs #152 |
| R-07 | Mitigar | Rotacionar senhas bootstrap/seed por ambiente | Product owner | Contínuo | seguranca.md |
| R-08 | Mitigar | Operar processo de privacidade conforme #195 | Product owner | Contínuo | #195 |
| R-09 | Mitigar | Fixar Actions; revisar SBOM; bloquear deps High+ | Engenharia | Contínuo | CI / SBOM |
| R-10 | Mitigar | Forçar TLS + WAF em edges hosted | Ops plataforma | Antes do SaaS GA | #217 |
| R-11 | Mitigar | Docs SLA/DR publicados; ativar status page; completar drill staging | Product owner | AC restantes #197 | [#197](https://github.com/ayelenleclerc/BizCode/issues/197) |
| R-12 | Mitigar | Briefing de conscientização; registro de presença | Product owner | 90 dias após merge #196 | RH / ops |

## Temas de lacuna fechados por este issue (#196)

- Gap Anexo A documentado.
- SoA inicial (SEC-002).
- Seção política SGSI (SEC-001 / seguranca.md).
- Registro de riscos + este plano.

## Histórico de revisões

| Versão | Data | Autor | Resumo |
|--------|------|-------|--------|
| 0.1 | 2026-04-01 | BizCode | Stub inicial |
| 0.2 | 2026-08-25 | BizCode | Ações de tratamento iniciais #196 |
