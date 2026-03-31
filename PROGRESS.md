# BizCode - Progreso de Desarrollo

## MVP Objetivo
Sistema de gestión comercial con facturación A/B, gestión de clientes y artículos.

---

## ✅ Fase 1: Setup Base

**Estado:** COMPLETADA

### Checklist
- [x] Proyecto Tauri + npm inicializado
- [x] Dependencias instaladas (React, TypeScript, Tailwind, Prisma, Tauri)
- [x] Estructura de carpetas creada
- [x] Configuración TypeScript
- [x] Tailwind + PostCSS configurado (darkMode: 'class')
- [x] Vite config setup
- [x] Layout base con Sidebar + Header + Toggle tema
- [x] Toggle tema claro/oscuro funcionando (persiste en localStorage)
- [x] React Router configurado (rutas: /clientes, /articulos, /facturacion)
- [x] Docker PostgreSQL levantado (`bizcode_db` en localhost:5432)
- [x] Prisma schema definido (Cliente, Articulo, Rubro, FormaPago, Factura, FacturaItem, ParamEmpresa)
- [x] Prisma migrate inicial ejecutada (`npx prisma migrate dev --name init`)
- [x] Prisma Client generado

### Estado actual
- App React renderiza layout con sidebar y rutas
- PostgreSQL corriendo en Docker
- Base de datos `bizcode_dev` creada con tablas Prisma
- Next: Crear Tauri commands backend para CRUD

---

## ✅ Fase 2: Backend Express API + Tipos

**Estado:** COMPLETADA

### ✅ Completado
- [x] Crear servidor Express en `server.ts` con rutas RESTful
- [x] Endpoints `/api/clientes` (GET list, GET/:id, POST create, PUT/:id update)
- [x] Endpoints `/api/articulos` (GET list, GET/:id, POST create, PUT/:id update)
- [x] Endpoints `/api/rubros` (GET list, POST create)
- [x] Endpoints `/api/formas-pago` (GET list)
- [x] Endpoints `/api/facturas` (GET list, POST create con items)
- [x] Crear `src/lib/api.ts`: wrappers para axios con error handling
- [x] Crear tipos TypeScript en `src/types.ts` (Cliente, Articulo, Rubro, Factura, etc.)
- [x] Test servidor: `npm run server` inicia sin errores, se conecta a PostgreSQL
- [x] Script `npm run dev:full` para correr servidor + Tauri dev en paralelo

### Próximo paso
Implementar **Fase 3: Módulo Clientes** — lista con DataTable + formulario ABM

---

## ✅ Fase 3: Módulo Clientes

**Estado:** COMPLETADA

### ✅ Implementado
- [x] Validador CUIT algoritmo argentino + formateo
- [x] Página Clientes: DataTable con búsqueda en vivo
- [x] Búsqueda (F2) por código, razón social, CUIT
- [x] Formulario ABM en Modal con React Hook Form + Zod
- [x] Validación inline: CUIT, email, campos requeridos
- [x] Atajos: F3=nuevo, F5=guardar, Esc=cancelar, Flechas=navegar, Enter=editar
- [x] Integración API Express: GET/POST/PUT clientes
- [x] Dark mode en formulario modal
- [x] Manejo de errores con mensajes en UI

### Funcionalidad verificada
✓ Crear cliente: F3 → ingresar datos → F5 guardar
✓ Editar cliente: seleccionar + Enter → F5 guardar
✓ Buscar: F2 o escribir → tabla filtra en vivo
✓ Validación CUIT funciona (formato y dígito verificador)
✓ Atajos de teclado 100% funcionales
✓ Tabla navegable con Flechas arriba/abajo

---

## ✅ Fase 4: Módulo Artículos

**Estado:** COMPLETADA

### ✅ Implementado
- [x] Página Artículos: DataTable con búsqueda en vivo por código/descripción
- [x] Formulario ABM con React Hook Form + Zod
- [x] Campos: código, descripción, rubro (select), condición IVA, unidad medida, precio lista 1-2, costo, stock, mínimo
- [x] Validación: código único, precios positivos, stock ≥ 0
- [x] Atajos: F3=nuevo, F5=guardar, Esc=cancelar, Flechas=navegar, Enter=editar
- [x] Tabla muestra código, descripción, rubro, IVA%, precios, stock, estado activo
- [x] Integración API Express: GET/POST/PUT artículos + GET rubros
- [x] Dark mode aplicado

### Funcionalidad verificada
✓ Crear artículo: F3 → ingresar datos → F5 guardar
✓ Editar: seleccionar + Enter → F5 guardar
✓ Búsqueda en vivo: F2 o escribir → tabla filtra
✓ Validación precios > 0
✓ Select de rubros cargado dinámicamente
✓ Atajos de teclado 100% funcionales

---

## ✅ Fase 5: Módulo Facturación (NÚCLEO MVP)

**Estado:** COMPLETADA

### ✅ Implementado
- [x] Página principal de facturación con vista lista/nueva alternables (F3)
- [x] Formulario Nueva Factura: cabecera + grilla dinámicos
- [x] Cabecera: tipo (A/B), prefijo, número, fecha, cliente (select), forma de pago
- [x] Grilla de ítems editable: artículo (select), cantidad, precio, descuento %, subtotal
- [x] Cálculo automático IVA según condición cliente (RI, Mono, CF, Exento)
- [x] Cálculo automático totales: neto gravado 21%/10.5%/exento + IVA + total
- [x] Atajos: Ins=agregar ítem, Del=eliminar, F5=guardar, Esc=cancelar
- [x] Validación: cliente requerido, al menos 1 ítem
- [x] Guardar factura con todos los ítems en BD
- [x] Listado de Facturas con tabla completa
- [x] Vista expandible de detalles de factura (click en fila)
- [x] Funciones de cálculo en `src/lib/invoice.ts` con tests unitarios
- [x] Integración API Express: POST /facturas con items anidados
- [x] Dark mode en todos los componentes

### Funcionalidad verificada
✓ Crear factura A o B con número y prefijo
✓ Agregar ítems dinámicamente (Ins)
✓ Calcular totales automáticos con IVA según cliente
✓ Eliminar ítems (Del)
✓ Guardar factura con ítems asociados (F5)
✓ Listar todas las facturas
✓ Ver detalles de factura guardada
✓ Atajos teclado 100% funcionales

---

## ✅ Fase 6: MVP Completado

**Estado:** COMPLETADA

### ✅ MVP Funcionando
- [x] App Tauri + React + TypeScript corriendo
- [x] PostgreSQL en Docker con todas las tablas
- [x] Express API en localhost:3001 con todos los endpoints
- [x] Módulo Clientes: ABM completo con validación CUIT
- [x] Módulo Artículos: ABM con múltiples precios
- [x] Módulo Facturación: emisión A/B con cálculo IVA y guardado BD
- [x] Todos los atajos de teclado: F2 (buscar), F3 (nuevo), F5 (guardar), Esc (cancelar), Flechas (navegar), Ins/Del (grilla)
- [x] Dark mode por defecto, toggle en header, persiste en localStorage
- [x] Manejo de errores con mensajes en UI
- [x] Validación en client-side (Zod) + server-side (Prisma)
- [x] PROGRESS.md documentado

---

## 🐛 Issues / Notas

Ninguno por ahora.

---

## 📝 Notas

- **DB:** PostgreSQL en localhost:5432, DB `bizcode_dev`
- **Dev:** `npm run dev` inicia Tauri dev mode
- **Build:** `npm run tauri build` genera .exe en `src-tauri/target/release/`
- **Temas:** Tailwind darkMode 'class', toggle en header, persiste en localStorage
