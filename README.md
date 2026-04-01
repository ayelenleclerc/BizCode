# Rama `documentacion` (huérfana)

Esta rama **no comparte historial** con `main`. Sirve para publicar solo material documental (por ejemplo **GitHub Pages**, sitio estático o export HTML/Markdown) sin el código de la aplicación.

## Uso habitual

1. Desde `main`, generar o copiar los artefactos que quieras exponer (p. ej. `docs/` o build estático).
2. En esta rama, sustituir o añadir el contenido y hacer commit.
3. Configurar Pages u otro hosting apuntando a esta rama (carpeta raíz o `/docs` según el proveedor).

## Nota

El contenido de esta rama **no se actualiza solo** al mergear `main`; conviene un flujo explícito (script, workflow CI o pasos manuales) cuando quieras alinear la documentación publicada con el repositorio principal.
