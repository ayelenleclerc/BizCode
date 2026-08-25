# Registro de riscos

| Código do documento | RSK-002 |
| Versão | 0.2 |
| Data | 2026-08-25 |
| Autor | BizCode |
| Nível de requisito | Obrigatório |
| Aplicabilidade normativa | ISO 9001:2015; ISO/IEC 27001:2022; ISO/IEC 20000-1:2018; ISO/IEC 42001:2023 |
| Estado de evidência | Parcial — riscos críticos iniciais #196 (≥10) |

## Declaração de fora de escopo

Registro ISO-ready do escopo SGSI de produto BizCode. Não afirma certificação.

## Propósito

Registrar os riscos de segurança da informação mais críticos a partir do gap Anexo A e do modelo de ameaças do produto.

## Escala

| Valor | Probabilidade | Impacto |
|-------|---------------|---------|
| L / M / H | Baixa / Média / Alta | Baixo / Médio / Alto |

## Registro (≥10 riscos críticos)

| ID | Risco | L | I | Dono | Anexo A / controle | Evidência / notas |
|----|-------|---|---|------|--------------------|-------------------|
| R-01 | IDOR cross-tenant / controle de acesso quebrado | M | H | Engenharia | A.8.3, A.5.15 | RBAC parcial; foco pentest [#194](https://github.com/ayelenleclerc/BizCode/issues/194) |
| R-02 | Segredos/tokens em logs ou artefatos CI | M | H | Engenharia | A.8.12, A.8.15 | Redação + `check:logs` |
| R-03 | Dependência High+ sem patch | M | H | Engenharia | A.8.8, A.5.21 | `pnpm audit` + Snyk; triagem #219 |
| R-04 | Sem revisão de segurança independente antes do lançamento | H | H | Product owner | A.5.35, A.8.29 | Registro pentest vazio; #194 OPEN |
| R-05 | Falha de restore / DR não testado | M | H | Ops plataforma | A.8.13, A.5.30 | Scripts #150; drill/#197 pendente |
| R-06 | Confusão staging/produção (DB/segredos) | M | H | Ops plataforma | A.8.31, A.8.9 | Docs #152 |
| R-07 | Compromisso SuperAdmin / bootstrap | L | H | Product owner | A.8.2, A.5.17 | Senhas só em env |
| R-08 | Cumprimento incompleto de privacidade / titular | M | M | Product owner | A.5.34 | Docs #195 |
| R-09 | Compromisso supply-chain (npm / Actions) | M | H | Engenharia | A.5.21 | Lockfile + audit; SBOM gerado |
| R-10 | Exposição SaaS sem TLS / WAF mal configurado | M | H | Ops plataforma | A.8.20, A.5.23 | Helmet/CORS; Cloudflare #217 |
| R-11 | Lacuna de continuidade (sem SLA / RTO não provado) | H | H | Product owner | A.5.29, A.5.30 | [#197](https://github.com/ayelenleclerc/BizCode/issues/197) |
| R-12 | Conscientização insuficiente de operadores | M | M | Product owner | A.6.3 | Sem registros de treinamento |

Tratamento: [RSK-004](rsk-004-plano-tratamento-riscos.md). Contexto: [gap Anexo A](../../quality/analise-lacunas-anexo-a-iso27001.md).

## Histórico de revisões

| Versão | Data | Autor | Resumo |
|--------|------|-------|--------|
| 0.1 | 2026-04-01 | BizCode | Stub inicial |
| 0.2 | 2026-08-25 | BizCode | ≥12 riscos iniciais #196 |
