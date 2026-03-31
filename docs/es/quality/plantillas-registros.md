# Plantillas de Registros de Calidad

## Plantilla: Registro de No Conformidad

**Referencia estándar:** ISO 9001:2015 §10.2.2

```
No Conformidad #: NC-YYYYMMDD-NNN
Fecha de detección: AAAA-MM-DD
Detectado por: [nombre / pipeline CI]
Etapa: [ ] Revisión de código  [ ] CI  [ ] Test manual  [ ] Producción

DESCRIPCIÓN:
Describa brevemente la no conformidad (qué sucedió, dónde, cuándo).

CAUSA RAÍZ (5 Porqués):
1. ¿Por qué ocurrió? →
2. ¿Por qué ocurrió eso? →
3. ¿Por qué ocurrió eso? →
4. ¿Por qué ocurrió eso? →
5. Causa raíz identificada:

ACCIÓN CORRECTIVA:
Describir el fix implementado. Referencia al commit o PR: #XXX

ACCIÓN PREVENTIVA:
Describir la medida tomada para evitar recurrencia
(ej: nuevo test case, nueva regla de ESLint, actualización de DoD).

VERIFICACIÓN:
[ ] Test que reproduce el bug fue agregado y pasa
[ ] CI pipeline verde con el fix
[ ] Revisado por:                     Fecha:

Estado: [ ] Abierta  [ ] En progreso  [ ] Cerrada
Fecha de cierre:
```

---

## Plantilla: Registro de Cambio

```
Cambio #: CHG-YYYYMMDD-NNN
Tipo: [ ] Feature  [ ] Fix  [ ] Refactor  [ ] Docs  [ ] CI/CD
PR/Commit: #XXX

DESCRIPCIÓN DEL CAMBIO:

ARCHIVOS AFECTADOS:
-
-

IMPACTO EN TESTS:
[ ] Tests existentes siguen pasando
[ ] Nuevos tests agregados: (describir)
[ ] Cobertura afectada: (antes / después)

IMPACTO EN ACCESIBILIDAD:
[ ] No aplica  [ ] Revisado con axe DevTools  [ ] jsx-a11y sin nuevas warnings

IMPACTO EN I18N:
[ ] No hay strings nuevos/modificados
[ ] Nuevas claves agregadas a los 3 locales y check:i18n pasa

APROBADO POR:                         Fecha:
```

---

## Plantilla: Registro de Sesión de Test Manual

```
Test Session #: TS-YYYYMMDD-NNN
Fecha: AAAA-MM-DD
Versión testeada: (commit hash o tag)
Tester:

AMBIENTE:
SO: [ ] Windows 11  [ ] macOS  [ ] Linux
Modo: [ ] Dev (Vite)  [ ] Build Tauri

CASOS DE PRUEBA:

| # | Escenario | Resultado | Observaciones |
|---|---|---|---|
| 1 | Crear cliente nuevo con CUIT válido | [ ] Pass  [ ] Fail | |
| 2 | Crear cliente con CUIT inválido — ver error | [ ] Pass  [ ] Fail | |
| 3 | Buscar cliente por nombre | [ ] Pass  [ ] Fail | |
| 4 | Editar cliente existente | [ ] Pass  [ ] Fail | |
| 5 | Crear artículo nuevo | [ ] Pass  [ ] Fail | |
| 6 | Emitir Factura A a RI con 2 ítems mixtos (21% y 10.5%) | [ ] Pass  [ ] Fail | |
| 7 | Verificar cálculo de IVA en factura (neto × alícuota = IVA) | [ ] Pass  [ ] Fail | |
| 8 | Emitir Factura B a CF (IVA no desglosado) | [ ] Pass  [ ] Fail | |
| 9 | Navegar tabla con teclado (↑↓ Enter) | [ ] Pass  [ ] Fail | |
| 10 | Verificar cambio de idioma (ES → EN → PT-BR) | [ ] Pass  [ ] Fail | |

DEFECTOS ENCONTRADOS:
(Referenciar NC si se abre una no conformidad)

VEREDICTO: [ ] Aprobado  [ ] Aprobado con observaciones  [ ] Rechazado

Firma del tester:                     Fecha:
```
