# Declaração de aplicabilidade (SoA)

| Código do documento | SEC-002 |
| Versão | 0.2 |
| Data | 2026-08-25 |
| Autor | BizCode |
| Nível de requisito | Obrigatório |
| Aplicabilidade normativa | ISO/IEC 27001:2022 |
| Estado de evidência | Parcial — SoA inicial ligada ao gap Anexo A (#196) |

## Declaração de fora de escopo

Esta SoA apoia a preparação **ISO-ready** do BizCode. **Não** afirma certificação ISO/IEC 27001.

## Propósito

Declarar quais controles do Anexo A se aplicam ao escopo SGSI de produto BizCode, apontar a análise de lacunas e registrar exclusões de alto nível.

## Análise de lacunas canônica

Status controle a controle: [Análise de lacunas Anexo A](../../quality/analise-lacunas-anexo-a-iso27001.md).

## Escopo SGSI

| No escopo | Fora do escopo (atual) |
|-----------|------------------------|
| Software BizCode (API, web, desktop, apps mobile documentados) | Instalações físicas do operador (Anexo A.7) |
| Controles de engenharia neste repositório e GitHub Actions | Processos de RH de emprego (maior parte de A.6) |
| Procedimentos documentados sob `docs/` | Certificação externa Stage 1/2 |

## Resumo de aplicabilidade

| Tema | Aplica? | Notas |
|------|---------|-------|
| A.5 Organizacional | Em grande parte sim | Muitos Partial / Not evidenced — ver gap |
| A.6 Pessoas | Limitado | Conscientização/relato Partial; triagem/emprego N/A |
| A.7 Físico | Não (N/A) | Hosting/escritório = provedor/operador |
| A.8 Tecnológico | Sim | Melhor evidência de produto; BC/redundância → #197 |

## Exclusões (justificadas)

1. **A.7.1–A.7.14** — BizCode não opera instalações físicas dedicadas no repo.
2. **A.6.1, A.6.2, A.6.4, A.6.6** — Processos trabalhistas/RH fora do repositório de produto.
3. **A.8.23 Filtragem web** — Não é controle de produto BizCode.

## Documentos controlados relacionados

- [SEC-001 Política de segurança da informação](sec-001-politica-seguranca-informacao.md)
- [RSK-002 Registro de riscos](../rsk/rsk-002-registro-riscos.md)
- [RSK-004 Plano de tratamento](../rsk/rsk-004-plano-tratamento-riscos.md)

## Histórico de revisões

| Versão | Data | Autor | Resumo |
|--------|------|-------|--------|
| 0.1 | 2026-04-01 | BizCode | Stub inicial |
| 0.2 | 2026-08-25 | BizCode | SoA inicial #196; link ao gap Anexo A |
