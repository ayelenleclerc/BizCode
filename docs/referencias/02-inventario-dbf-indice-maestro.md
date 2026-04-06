# Inventario maestro — archivos `.DBF`

## Evidencia de esta copia

| Campo | Valor |
|-------|--------|
| **Carpeta `sistema` resuelta** | `E:\Z- programa Suarez\16-07-2025 completa\16-07-2025 completa\sistema` |
| **`PROGRAMA_VIEJO_ROOT` usado** | `E:\Z- programa Suarez\16-07-2025 completa` |
| **Total archivos `.DBF`** | 107 |
| **Volcado completo (campos + muestras vacías)** | [`exports/inventario-dbf-volcado.md`](exports/inventario-dbf-volcado.md) |
| **Regenerar** | `npm run inspect:dbf-all -- --format markdown --sample 0` |

## Columna «Grupo»

Heurística por nombre de archivo (revisable en [`06-modulos-funcionales-legacy.md`](06-modulos-funcionales-legacy.md)). Regenerar tabla con columna Grupo:

```bash
node scripts/_generate-referencias-02-table.mjs docs/referencias/exports/inventario-dbf-volcado.md
```

## Tabla maestra

| Archivo | Registros | Tamaño (bytes) | Grupo | Estado análisis |
|---------|-----------|----------------|-------|-----------------|
| ACCESOS.DBF | 0 | 131 | C | pendiente |
| ANULADOS.DBF | 12 | 1331 | E | pendiente |
| ART_LST.DBF | 0 | 227 | A | pendiente |
| ARTIC.DBF | 2038 | 1131135 | B | pendiente |
| BANCOS.DBF | 312 | 7898 | C | pendiente |
| BORRAR.DBF | 1251 | 154707 | E | pendiente |
| CAJAS.DBF | 99 | 2111 | C | pendiente |
| CCTE_V.DBF | 177399 | 22175710 | C | pendiente |
| CHEQUES.DBF | 2 | 1043 | C | pendiente |
| CIE_CAJA.DBF | 7 | 1688 | C | pendiente |
| CLAS01.DBF | 0 | 99 | B | pendiente |
| CLAS02.DBF | 0 | 99 | B | pendiente |
| CLAS03.DBF | 0 | 99 | B | pendiente |
| CLAS04.DBF | 0 | 99 | B | pendiente |
| CLAS05.DBF | 0 | 99 | B | pendiente |
| CLAS06.DBF | 0 | 99 | B | pendiente |
| CLAS07.DBF | 0 | 99 | B | pendiente |
| CLAS08.DBF | 0 | 99 | B | pendiente |
| CLAS09.DBF | 0 | 99 | B | pendiente |
| CLAS10.DBF | 0 | 99 | B | pendiente |
| CLAVES.DBF | 8 | 1242 | C | pendiente |
| CLIENTES.DBF | 2310 | 2575999 | C | pendiente |
| COLORES.DBF | 23 | 2783 | B | pendiente |
| COMIS.DBF | 96191 | 7022457 | D | pendiente |
| CONCEPTO.DBF | 5 | 214 | B | pendiente |
| CTA_GS.DBF | 0 | 291 | B | pendiente |
| DEP_CLI.DBF | 1 | 469 | C | pendiente |
| DET_COMP.DBF | 4173 | 359009 | D | pendiente |
| ENCAB_TK.DBF | 5 | 271 | D | pendiente |
| ENCAB.DBF | 4 | 275 | D | pendiente |
| ESCALAS.DBF | 0 | 419 | B | pendiente |
| FACT.DBF | 418354 | 138058295 | D | pendiente |
| FPAGO.DBF | 99 | 4681 | B | pendiente |
| GASTOS.DBF | 9 | 1566 | B | pendiente |
| HIST_CLI.DBF | 25 | 888 | C | pendiente |
| IVA_V.DBF | 316 | 106071 | D | pendiente |
| LIST_CLI.DBF | 34 | 3214 | A | pendiente |
| LIST_PRO.DBF | 14 | 1028 | A | pendiente |
| LOCK_ABM.DBF | 5 | 264 | E | pendiente |
| LUGAR.DBF | 1 | 83 | B | pendiente |
| MONEDA.DBF | 18 | 265 | B | pendiente |
| MOV_STK.DBF | 17809 | 3776183 | D | pendiente |
| NOV_ART.DBF | 0 | 1219 | B | pendiente |
| NOV_CLI.DBF | 0 | 2083 | B | pendiente |
| PAGOS.DBF | 206423 | 61515176 | D | pendiente |
| PARAM1_V.DBF | 1 | 8530 | B | pendiente |
| PARAM2_V.DBF | 100 | 19703 | B | pendiente |
| PARIDAD.DBF | 4 | 459 | B | pendiente |
| PCIAS.DBF | 24 | 754 | B | pendiente |
| PEDIDO1.DBF | 6 | 1665 | D | pendiente |
| PEDIDO2.DBF | 22 | 1468 | D | pendiente |
| PEDIDO3.DBF | 24 | 3227 | D | pendiente |
| pmanual.dbf | 152908 | 13609327 | D | pendiente |
| PROCESOS.DBF | 127 | 4956 | C | pendiente |
| PROVE.DBF | 39 | 16059 | B | pendiente |
| PUESTOS.DBF | 100 | 2299 | B | pendiente |
| PVAR.DBF | 0 | 899 | B | pendiente |
| PVAR1.DBF | 0 | 547 | B | pendiente |
| PVAR2.DBF | 193 | 29819 | B | pendiente |
| REIMPRE.DBF | 0 | 323 | E | pendiente |
| REMITOS.DBF | 14 | 4889 | D | pendiente |
| REPART1.DBF | 38522 | 5278124 | D | pendiente |
| REPART2.DBF | 192524 | 3658086 | D | pendiente |
| RUBRO.DBF | 10 | 463 | B | pendiente |
| SDO_INI.DBF | 2 | 453 | B | pendiente |
| ST1_UV.DBF | 0 | 291 | B | pendiente |
| ST2_UV.DBF | 0 | 291 | B | pendiente |
| STRU_A03.DBF | 0 | 547 | A | pendiente |
| STRU_A06.DBF | 0 | 259 | A | pendiente |
| STRU_ART.DBF | 42 | 528 | A | pendiente |
| STRU_B19.DBF | 0 | 323 | A | pendiente |
| STRU_B23.DBF | 0 | 195 | A | pendiente |
| STRU_B24.DBF | 0 | 355 | A | pendiente |
| STRU_B25.DBF | 0 | 259 | A | pendiente |
| STRU_B26.DBF | 0 | 355 | A | pendiente |
| STRU_B27.DBF | 0 | 323 | A | pendiente |
| STRU_B29.DBF | 0 | 259 | A | pendiente |
| STRU_B30.DBF | 0 | 323 | A | pendiente |
| STRU_B34.DBF | 0 | 227 | A | pendiente |
| STRU_B35.DBF | 0 | 323 | A | pendiente |
| STRU_B38.DBF | 0 | 387 | A | pendiente |
| STRU_C09.DBF | 0 | 323 | A | pendiente |
| STRU_C23.DBF | 0 | 579 | A | pendiente |
| STRU_C30.DBF | 0 | 419 | A | pendiente |
| STRU_C32.DBF | 0 | 419 | A | pendiente |
| STRU_C33.DBF | 0 | 259 | A | pendiente |
| STRU_C8A.DBF | 0 | 387 | A | pendiente |
| STRU_C8B.DBF | 0 | 451 | A | pendiente |
| STRU_D04.DBF | 0 | 387 | A | pendiente |
| STRU_D05.DBF | 0 | 419 | A | pendiente |
| STRU_D21.DBF | 0 | 451 | A | pendiente |
| STRU_D22.DBF | 0 | 483 | A | pendiente |
| STRU_D23.DBF | 0 | 483 | A | pendiente |
| STRU_D24.DBF | 0 | 355 | A | pendiente |
| STRU_D25.DBF | 0 | 515 | A | pendiente |
| STRU_IB.DBF | 0 | 67 | A | pendiente |
| STRU_LST.DBF | 0 | 131 | A | pendiente |
| STRU_PC.DBF | 0 | 1347 | A | pendiente |
| STRU_PRO.DBF | 0 | 99 | A | pendiente |
| STRU_STK.DBF | 100 | 34479 | A | pendiente |
| TABLA_V.DBF | 26 | 1203 | A | pendiente |
| TCALLES.DBF | 0 | 163 | B | pendiente |
| TIPONEG.DBF | 23 | 513 | B | pendiente |
| UREM.DBF | 0 | 515 | D | pendiente |
| uv.dbf | 775363 | 89942750 | D | pendiente |
| VEND.DBF | 21 | 14635 | B | pendiente |
| ZONAS.DBF | 49 | 1324 | B | pendiente |
