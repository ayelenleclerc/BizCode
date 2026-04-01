# ADR-0001: REST API with Express 5 + Prisma 5

**Status:** Accepted
**Date:** 2026-01-01
**ISO Reference:** ISO/IEC 12207:2017 §6.3.2 (Software Design)

---

## Context

BizCode needs a persistent data layer for customers, products, and invoices. The frontend is a React SPA running inside a Tauri WebView. Tauri does not provide a built-in database binding that supports relational queries and migrations at the required complexity level.

Options considered:

1. **SQLite via Tauri plugin** (`tauri-plugin-sql`): Simple, no separate process. Limited: no server-side validation, no type-safe query builder, migrations are manual.
2. **Express + Prisma + PostgreSQL (chosen)**: Mature ecosystem, type-safe ORM, automatic migrations, testable independently of the desktop shell.
3. **Electron + better-sqlite3**: Would require switching from Tauri, a larger bundle, and loses Rust security model.

## Decision

Use **Express 5** as the API framework running as a Tauri sidecar process, **Prisma 5** as the ORM for type-safe queries and migration management, and **PostgreSQL 16** as the database.

## Consequences

**Positive:**
- Prisma generates a fully-typed client from the schema, eliminating runtime type errors in database calls.
- Migrations are tracked in `prisma/migrations/` and are repeatable.
- The API can be tested independently (unit tests mock Axios; integration tests run against a real PostgreSQL instance in CI).
- Express is well-understood and has a large ecosystem.

**Negative:**
- Requires PostgreSQL to be running separately (Docker or native install). This adds setup friction compared to SQLite.
- All routes currently live in a single `server.ts` file. As the API grows, this must be refactored into separate routers (tracked as technical debt).
- The sidecar approach adds ~50ms startup latency while Express initializes.
