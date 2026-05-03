# Arquitetura

## Visão geral

BizCode é um **aplicativo desktop** construído com Tauri 1.5. O shell em Rust hospeda um SPA React empacotado com Vite como janela principal. Um servidor API Express 5 executa como processo sidecar do Tauri e fornece o backend REST. Os dados são armazenados no PostgreSQL via Prisma 5.

## Diagrama de componentes

```
┌────────────────────────────────────────────────────────────────┐
│  Tauri Desktop Shell (Rust)                                    │
│                                                                │
│  ┌─────────────────────────┐    ┌────────────────────────────┐ │
│  │  WebView (React SPA)    │    │  Express 5 Sidecar (Node)  │ │
│  │                         │    │                            │ │
│  │  React 18 + TypeScript  │◄──►│  REST API (:3001)          │ │
│  │  Vite 5 (bundled)       │    │  Prisma 5 ORM              │ │
│  │  react-i18next (i18n)   │    │  Validação de entrada      │ │
│  │  react-hook-form + zod  │    │                            │ │
│  └─────────────────────────┘    └────────────┬───────────────┘ │
│                                              │                 │
└──────────────────────────────────────────────┼─────────────────┘
                                               │ TCP
                                    ┌──────────▼──────────┐
                                    │  PostgreSQL 16       │
                                    │  (processo externo)    │
                                    └─────────────────────┘
```

## Fluxo de dados

```
Ação do usuário (teclado/clique)
  → Componente React (estado da UI)
    → react-hook-form + Zod (validação no cliente)
      → src/lib/api.ts (cliente HTTP Axios)
        → Handler de rota Express
          → Construtor de consultas Prisma
            → PostgreSQL
          ← Resultado Prisma (tipado)
        ← Resposta JSON { data: ... }
      ← Resultado tipado
    ← Atualização de estado do componente
  → Re-renderização
```

## Módulos principais

| Caminho | Responsabilidade |
|---|---|
| `src/main.tsx` | Raiz React; importa configuração i18n |
| `src/i18n/config.ts` | Inicialização i18next (imports estáticos, sem backend HTTP) |
| `src/lib/api.ts` | Fábrica Axios; helpers por namespace |
| `src/lib/validators.ts` | Lógica pura de validação (CUIT, preço, código) |
| `src/lib/invoice.ts` | Motor de cálculo de faturas (IVA conforme cliente) |
| `src/components/layout/Layout.tsx` | Shell: navegação lateral, tema (`localStorage` `theme`; classes `dark`/`light` em `<html>`) |
| `src/pages/clientes/` | CRUD de clientes |
| `src/pages/articulos/` | CRUD de produtos |
| `src/pages/facturacion/` | Emissão e listagem de faturas |
| `server/main.ts` | Entrada CLI (`npm run server`): chama `startServer()` em `server.ts` |
| `server.ts` (raiz) | Bootstrap: `createServerInstance`, `bindHttpServer`, `startServer`; usa `createApp` de `server/createApp.ts` |
| `server/createApp.ts` | Fábrica Express reutilizável em testes de contrato OpenAPI (middleware, routers de auth, `registerRestDomainRoutes`) |
| `server/registerRestDomainRoutes.ts` | Registra REST de domínio sob `/api/*` via módulos em `server/routes/` (CSV/validação compartilhados em `server/routes/restDomainShared.ts`) |

## Temas (Tailwind modo escuro)

- **Configuração:** `tailwind.config.js` usa `darkMode: 'class'`.
- **Referência:** [temas-interface.md](temas-interface.md) (classes em `<html>`, script em `index.html`, persistência).
- **Risco evitado:** não fixar `class="dark"` em `<body>`; com `dark:` em qualquer ancestral, o tema permanece escuro mesmo se o React atualizar `<html>`.

## Direção estratégica (produto)

O **mesmo domínio de negócio** deve suportar **desktop** (este documento) e, quando implementado, **SaaS hospedado**, com **comportamento fiscal** isolado em **módulos por país/jurisdição**. Ver [visao-produto-e-implantacao.md](quality/visao-produto-e-implantacao.md) (PROD-VISION-001) e [ADR-0007](adr/ADR-0007-dual-deployment-and-fiscal-modularity.md).

## Riscos e restrições

- **Superfície da API em módulos:** `server/createApp.ts` compõe middleware e routers; os handlers REST de domínio ficam em `server/routes/` e são registrados a partir de `server/registerRestDomainRoutes.ts`. `server.ts` expõe o bootstrap; `server/main.ts` é a entrada do `npm run server`.
- **Sessão e exposição à rede:** há cookie de sessão, `resolveSession` e `requirePermission` nas rotas protegidas (ver `server/auth.ts` e [modelo-iam-sessoes-auditoria.md](quality/modelo-iam-sessoes-auditoria.md)). O layout desktop padrão ainda pressupõe sidecar local em loopback; SaaS hospedado exige transporte e hardening conforme [seguranca.md](seguranca.md).
- **Build Tauri fora do CI:** ver [quality/ciclo-ci-cd.md](quality/ciclo-ci-cd.md).
- **Sem modo offline:** o SPA exige o sidecar Express em execução.

**Outros idiomas:** [English](../en/arquitetura.md) · [Español](../es/arquitetura.md)
