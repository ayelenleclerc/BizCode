# Aprovação/arquivo de plano Cursor + sincronização GitHub (`plan:approve`, `plan:sync`)

## Finalidade

O comando `npm run plan:approve` é o ponto de entrada operacional para processar um plano Markdown no estilo Cursor já aprovado (front matter YAML entre delimitadores `---` mais corpo). Primeiro arquiva uma cópia imutável em `.cursor/plans/{timestamp}-{slug}.plan.md` e depois executa o mesmo comportamento de `npm run plan:sync`: valida todos/rótulos contra `.github/labels.json` e **cria ou atualiza issues** no GitHub com título `[PLAN:{nomeDoPlano}] …`. Adiciona cada issue ao **Project v2** do GitHub (quando configurado) e define o campo **Status** a partir do `status` de cada todo:

- `pending` → Backlog
- `in_progress` → In Progress
- `completed` → Done
- `cancelled` → Backlog + `type:chore` + comentário explicativo

Todos removidos do plano mas ainda presentes no arquivo de estado da última execução são tratados como **órfãos**: a issue é mantida, um comentário é adicionado, os rótulos passam a `type:chore`, `priority:P2`, `area:platform` (devem existir em `.github/labels.json`) e o status retorna a Backlog quando o item do projeto existir.

**Todos concluídos (`status: completed`):** a issue é criada ou atualizada como nos demais casos e o **Status** do projeto fica **Done** (backfill se o todo já estava feito antes do primeiro sync).

## Contrato do plano

Esquemas TypeScript em `scripts/github/plan-sync/types.ts`: front matter obrigatório `name`, `overview`, `todos[]` com `id`, `content`, `status` (`pending` \| `in_progress` \| `completed` \| `cancelled`), `meta` opcional (`type`, `priority`, `area`) com padrões `feature`, `P1`, `platform`.

## Rótulos heurísticos

Se o texto do todo ou o corpo do plano contêm palavras-chave simples, rótulos extras são aplicados (e devem existir em `.github/labels.json`): **`needs-docs`** (ex.: documentação, OpenAPI, i18n), **`needs-tests`** (ex.: teste, cobertura, Vitest, Playwright).

## Falhas de vínculo ao projeto

O catálogo **deve** incluir **`needs-spec`** (recuperação). Se a API do Project v2 falhar após a issue existir, a ferramenta comenta na issue, aplica **`needs-spec`** (mesclada aos rótulos atuais), mantém **`projectItemId` quando já foi resolvido** e **encerra com código 1**; a próxima `plan:sync` repete as operações do projeto.

## Pré-requisitos

- Configuração fase 1: ver [`.github/PROJECT_SETUP_PHASE1.md`](../../../.github/PROJECT_SETUP_PHASE1.md) (rótulos, campos do projeto, variáveis do repositório).
- Os rótulos vêm do `meta` de cada todo (padrões: `type:feature`, `priority:P1`, `area:platform`), heurísticas opcionais e **`needs-spec`** de recuperação; todos precisam existir em [`.github/labels.json`](../../../.github/labels.json).

## Uso

Na raiz do repositório:

```bash
npm run plan:approve -- --plan caminho/para/plano.plan.md
```

```bash
npm run plan:sync -- --plan caminho/para/plano.plan.md
```

Opções:

- `--repo-root <dir>` — raiz do repositório (padrão: diretório de trabalho atual).
- `--dry-run` — analisa e registra ações previstas; **sem** chamadas à API do GitHub e **sem** gravar estado/relatórios.
- `--archive-dir <dir>` — somente para `plan:approve`; diretório relativo para cópias arquivadas (padrão `.cursor/plans`).

## Hook do botão Build

Não há evidência de hook em nível de repositório para o botão **Build** do Cursor. **Not evidenced in current codebase**.
Use `npm run plan:approve -- --plan ...` como fluxo explícito de aprovação/arquivo.

## Variáveis de ambiente

- `GH_TOKEN` ou `GITHUB_TOKEN` (obrigatória): PAT com escopos `repo` e de projeto conforme necessário.
- `GITHUB_REPOSITORY` (obrigatória*): `owner/repo`.
- `GITHUB_OWNER` + `GITHUB_REPO` (obrigatória*): alternativa a `GITHUB_REPOSITORY`.
- `PROJECT_V2_ID` (obrigatória): id do nó do projeto.
- `PROJECT_STATUS_FIELD_ID` (obrigatória): id do campo Status (seleção única).
- `PROJECT_STATUS_OPTION_BACKLOG` (obrigatória): id da opção Backlog.
- `PROJECT_STATUS_OPTION_IN_PROGRESS` (obrigatória): id da opção In Progress.
- `PROJECT_STATUS_OPTION_DONE` (obrigatória): id da opção Done.
- `PROJECT_STATUS_OPTION_BLOCKED` (opcional): reservado para uso futuro.

## Artefatos persistentes (repositório)

Após sync bem-sucedido que não seja `--dry-run`:

- **Estado:** `.github/plan-sync/state/{slug}.json` — mapeia `id` do todo → `issueNumber`, hash do conteúdo, `projectItemId` opcional (reexecuções idempotentes; omitido até o vínculo ao projeto ter sucesso).
- **Relatórios:** `.github/plan-sync/reports/{timestamp}-{slug}.md` — log legível com **`syncDurationMs`** e **`projectLinkFailures`**.

A equipe pode versionar o estado compartilhado; caso contrário, tratar como local (o repositório não ignora por padrão).

## Referências

- [Documentação gerada](documentacao-gerada.md).
- [Ciclo CI/CD](ciclo-ci-cd.md) — o pipeline não executa `plan:sync` por padrão; é fluxo manual do operador.
