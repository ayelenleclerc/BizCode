# Arquitectura

## Visión general

BizCode es una **aplicación de escritorio** construida con Tauri 1.5. El shell en Rust aloja un SPA React empaquetado con Vite como ventana principal. Un servidor API Express 5 se ejecuta como proceso sidecar de Tauri y proporciona el backend REST. Los datos se almacenan en PostgreSQL mediante Prisma 5.

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
│  │  react-i18next (i18n)   │    │  Validación de entrada     │ │
│  │  react-hook-form + zod  │    │                            │ │
│  └─────────────────────────┘    └────────────┬───────────────┘ │
│                                              │                 │
└──────────────────────────────────────────────┼─────────────────┘
                                               │ TCP
                                    ┌──────────▼──────────┐
                                    │  PostgreSQL 16       │
                                    │  (proceso externo)   │
                                    └─────────────────────┘
```

## Flujo de datos

```
Acción del usuario (teclado/clic)
  → Componente React (estado UI)
    → react-hook-form + Zod (validación cliente)
      → src/lib/api.ts (cliente HTTP Axios)
        → Handler de ruta Express
          → Constructor de consultas Prisma
            → PostgreSQL
          ← Resultado Prisma (tipado)
        ← Respuesta JSON { data: ... }
      ← Resultado tipado
    ← Actualización de estado del componente
  → Re-renderizado
```

## Módulos clave

| Ruta | Responsabilidad |
|---|---|
| `src/main.tsx` | Raíz React; importa configuración i18n |
| `src/i18n/config.ts` | Inicialización i18next (imports estáticos, sin backend HTTP) |
| `src/lib/api.ts` | Fábrica Axios; helpers API por espacio de nombres |
| `src/lib/validators.ts` | Lógica pura de validación (CUIT, precio, código) |
| `src/lib/invoice.ts` | Motor de cálculo de facturas (IVA según condición del cliente) |
| `src/components/layout/Layout.tsx` | Shell: navegación lateral, conmutador de tema (`localStorage` `theme`; clases `dark`/`light` en `<html>`) |
| `src/pages/clientes/` | ABMC clientes |
| `src/pages/articulos/` | ABMC artículos |
| `src/pages/facturacion/` | Emisión y listado de facturas |
| `server.ts` (raíz) | Entrada: `createApp(prisma)` desde `server/createApp.ts`, listen y `PrismaClient` |
| `server/createApp.ts` | Fábrica Express reutilizable en tests de contrato OpenAPI |

## Tematización (Tailwind modo oscuro)

- **Configuración:** `tailwind.config.js` usa `darkMode: 'class'`.
- **Documento de referencia:** [temas-interfaz.md](temas-interfaz.md) (clases en `<html>`, script en `index.html`, persistencia, reglas para no romper el conmutador).
- **Riesgo evitado:** no fijar `class="dark"` en `<body>`; con `dark:` activo por cualquier ancestro, el tema quedaría siempre oscuro aunque React actualice `<html>`.

## Riesgos y restricciones conocidas

- **Rutas API en un solo módulo:** La lógica HTTP está en `server/createApp.ts` (un archivo); `server.ts` solo arranca el proceso. Evolución recomendada: routers por dominio (véase ADR futuro si se refactoriza).
- **Sin autenticación:** La API no tiene capa de autenticación. Está pensada para ejecutarse en local en la máquina del usuario (sidecar Tauri en loopback). Si la aplicación se expone a red, debe añadirse autenticación.
- **Build Tauri no en CI:** Requiere WebKit nativo por plataforma. Ver [quality/ciclo-ci-cd.md](quality/ciclo-ci-cd.md).
- **Sin modo offline:** El SPA React requiere el sidecar Express en ejecución. El ciclo de vida de Tauri lo garantiza en producción.
