# Lista de verificação QA manual

Para releases, regressão ou evidência de auditoria quando a automação não cobre o cenário (ex.: shell Tauri desktop).

**Relacionado:** [estrategia-testes.md](estrategia-testes.md) · [paridade-ambientes-testes.md](paridade-ambientes-testes.md)

---

## Critérios de entrada

- [ ] Node.js 22 LTS (`package.json` `engines`)
- [ ] `DATABASE_URL` válida; migrações aplicadas (`npx prisma migrate deploy`)
- [ ] Seed ou bootstrap se login for necessário (`BIZCODE_SEED_SUPERADMIN_PASSWORD` / `npx prisma db seed`)
- [ ] Gate automático verde no mesmo commit: `npm run type-check`, `npm run lint`, `npm run test:coverage`, `npm run test:integration` (se houver BD), `npm run test:e2e`

## Smoke funcional (web / Vite)

- [ ] Login: tenant `platform`, usuário `ayelen`, senha do ambiente
- [ ] Navegação: Inicio, Clientes, Artículos, Facturación — sem erros graves no console
- [ ] Fluxo de inclusão: pelo menos um cliente ou artículo (ou cancelar sem persistir) — registrar resultado

## Desktop (Tauri) — se aplicável

- [ ] `npm run dev` / build empacotado abre janela; mesmo smoke que a web onde houver rotas
- [ ] Registrar lacunas vs Playwright (shell nativo fora do CI)

## Acessibilidade (manual)

- [ ] Ordem de tabulação utilizável no login e um módulo principal
- [ ] Foco visível; erros de formulário associados aos campos testados

## Critérios de saída

- [ ] Lista concluída ou defeitos registrados com severidade
- [ ] Evidência anexada (ticket, capturas, logs)

---

**Outros idiomas:** [English](../../en/quality/manual-qa-checklist.md) · [Español](../../es/quality/lista-verificacion-qa-manual.md)
