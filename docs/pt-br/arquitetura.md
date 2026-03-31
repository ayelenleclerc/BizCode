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
| `server.ts` (raiz) | Entrada: `createApp(prisma)` de `server/createApp.ts`, listen e `PrismaClient` |
| `server/createApp.ts` | Fábrica Express reutilizável em testes de contrato OpenAPI |

## Temas (Tailwind modo escuro)

- **Configuração:** `tailwind.config.js` usa `darkMode: 'class'`.
- **Referência:** [temas-interface.md](temas-interface.md) (classes em `<html>`, script em `index.html`, persistência).
- **Risco evitado:** não fixar `class="dark"` em `<body>`; com `dark:` em qualquer ancestral, o tema permanece escuro mesmo se o React atualizar `<html>`.

## Riscos e restrições

- **Rotas da API em um único módulo:** a lógica HTTP está em `server/createApp.ts`; `server.ts` apenas inicia o processo. Evolução: routers por domínio.
- **Sem autenticação:** a API não tem camada de auth; uso local (loopback). Se exposta à rede, é necessário autenticação.
- **Build Tauri fora do CI:** ver [quality/ciclo-ci-cd.md](quality/ciclo-ci-cd.md).
- **Sem modo offline:** o SPA exige o sidecar Express em execução.

**Outros idiomas:** [English](../en/arquitetura.md) · [Español](../es/arquitetura.md)
