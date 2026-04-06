# Inventario físico — layout de carpetas

## Copia analizada (evidencia)

Raíz de trabajo del usuario (listado verificado en disco):

`E:\Z- programa Suarez\16-07-2025 completa\16-07-2025 completa\`

| Contenido | Descripción |
|-----------|-------------|
| `sistema\` | 107 archivos `.DBF` y archivos asociados (`.NTX`, etc.) — ver [`02-inventario-dbf-indice-maestro.md`](02-inventario-dbf-indice-maestro.md) |
| `DOSPrint\` | Utilidad DOSPrint (`DOSPrint.exe`, `DOSPrintUI.exe`, PDF) |
| `DOSPRINTER\` | Paquetes de impresión |
| `esc\` | Accesos directos (`.lnk`, `.pif`) |
| `SPOOL\` | Cola de impresión (puede estar vacía) |
| Raíz | `autoexec.bat`, `config.sys`, archivos `.set` según copia |

## Variable `PROGRAMA_VIEJO_ROOT`

Para que los scripts resuelvan `…\16-07-2025 completa\sistema`, en esta copia debe ser:

`E:\Z- programa Suarez\16-07-2025 completa`

*(Un nivel por encima de la carpeta duplicada `16-07-2025 completa` que contiene `sistema`.)*
