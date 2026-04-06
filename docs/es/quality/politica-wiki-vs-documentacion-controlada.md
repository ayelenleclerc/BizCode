# Política Wiki vs documentación controlada

## Finalidad

Definir qué contenido puede vivir en GitHub Wiki y qué contenido debe mantenerse en documentación controlada del repositorio para auditoría y gobernanza de releases.

## Decisión

- GitHub Wiki se permite para guías operativas y contenido de cambio rápido.
- La documentación del repositorio es obligatoria para artefactos controlados, auditables y sujetos a compuertas de calidad.

## Contenido controlado en repositorio (obligatorio en `docs/` o `Certificación-ISO/`)

- Documentación de calidad, procesos y cumplimiento.
- Evidencias ISO, procedimientos y registros de trazabilidad.
- Comportamiento de producto, contrato API y decisiones de arquitectura.
- Todo documento requerido por checks de CI o criterios de release.

## Contenido permitido en Wiki (solo soporte)

- Runbooks operativos y notas de troubleshooting.
- FAQs internas y guías rápidas.
- Notas temporales de investigación antes de formalizarlas en documentación controlada.

## Aplicación automática

- El workflow de CI `Docs governance guard` valida PRs que tocan documentación controlada.
- Si cambia documentación localizada controlada en un idioma, se exige cobertura EN/ES/PT-BR en el mismo PR.
- OpenAPI mantiene fuente única en `docs/api/openapi.yaml` (contrato no traducido).
