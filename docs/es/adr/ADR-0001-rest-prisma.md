# ADR-0001: API REST con Express 5 + Prisma 5

**Estado:** Aceptada  
**Fecha:** 2026-01-01  
**Referencia ISO:** ISO/IEC 12207:2017 §6.3.2

## Contexto

BizCode necesita persistencia para clientes, productos y facturas. El frontend es un SPA React dentro del WebView de Tauri.

## Opciones consideradas

1. SQLite vía plugin Tauri — simple, sin proceso aparte; limitaciones de validación y migraciones.
2. **Express + Prisma + PostgreSQL (elegido)** — ecosistema maduro, ORM tipado, migraciones automáticas, API testable fuera del shell.
3. Electron + better-sqlite3 — implicaría cambiar de Tauri.

## Decisión

Usar **Express 5** como framework API en proceso sidecar de Tauri, **Prisma 5** como ORM y **PostgreSQL 16** como base de datos.

## Consecuencias

**Positivas:** cliente Prisma tipado; migraciones en `prisma/migrations/`; API testable de forma independiente.

**Negativas:** PostgreSQL debe ejecutarse aparte; las rutas están hoy concentradas (deuda técnica); ~50 ms de latencia al arrancar el sidecar.

**Otros idiomas:** [English](../../en/adr/ADR-0001-rest-prisma.md) · [Português](../../pt-br/adr/ADR-0001-rest-prisma.md)
