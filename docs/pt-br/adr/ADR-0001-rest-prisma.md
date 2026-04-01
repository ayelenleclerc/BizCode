# ADR-0001: API REST com Express 5 + Prisma 5

**Status:** Aceita  
**Data:** 2026-01-01  
**Referência ISO:** ISO/IEC 12207:2017 §6.3.2

## Contexto

BizCode precisa de persistência para clientes, produtos e faturas. O frontend é um SPA React no WebView Tauri.

## Opções

1. SQLite via plugin Tauri — simples, porém limitações de validação e migrações.
2. **Express + Prisma + PostgreSQL (escolhido)** — ORM tipado, migrações, testável fora do shell.
3. Electron + better-sqlite3 — troca de stack, bundle maior.

## Decisão

**Express 5** como sidecar, **Prisma 5** como ORM, **PostgreSQL 16** como BD.

## Consequências

**Positivas:** cliente Prisma tipado; migrações em `prisma/migrations/`; API testável independentemente.

**Negativas:** PostgreSQL separado; rotas hoje concentradas (dívida técnica); latência ~50 ms no arranque do sidecar.

**Outros idiomas:** [English](../../en/adr/ADR-0001-rest-prisma.md) · [Español](../../es/adr/ADR-0001-rest-prisma.md)
