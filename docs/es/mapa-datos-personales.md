# Mapa de Datos Personales

## Inventario de Datos

| Campo | Entidad | Tipo | Propósito | Base legal | Retención |
|---|---|---|---|---|---|
| `rsocial` (Razón Social) | Cliente | Nombre de empresa o persona | Identificación en facturas | Obligación contractual | Duración de la relación comercial + 10 años (prescripción fiscal) |
| `cuit` (CUIT/CUIL) | Cliente | Identificador fiscal argentino | Facturación legal; validación ARCA | Obligación legal (Res. Gral. 1415, ARCA) | 10 años |
| `email` | Cliente | Dirección de correo electrónario | Comunicaciones comerciales (opcional) | Consentimiento | Hasta solicitud de eliminación |
| `domicilio`, `localidad`, `cpost` | Cliente | Dirección postal | Domicilio fiscal en facturas; texto de entrega en UI logística (sin coordenadas en `Cliente`) | Obligación contractual | 10 años |
| `telef` | Cliente | Número de teléfono | Contacto comercial (opcional) | Consentimiento | Hasta solicitud de eliminación |
| `receptorNombre`, `receptorDni` | RepartoItem (POD) | Nombre del receptor / DNI opcional | Comprobante de entrega con módulo `logistics.pod` | Obligación contractual / interés legítimo | Según política del operador y reparto |
| `podMedia` (firma / foto JSON) | RepartoItem (POD) | Imagen de firma; foto opcional del paquete | Comprobante de entrega | Obligación contractual | Igual que el reparto asociado |
| `lat`, `lng`, `recordedAt` | RepartoUbicacion | Muestra de geolocalización del chofer | Seguimiento en vivo con módulo `logistics.gps`; vínculo al chofer vía `Reparto.choferId` | Interés legítimo / operación | **7 días** (purga en aplicación + `npm run reparto-ubicacion:purge` opcional) |
| `username`, role | AppUser (chofer / personal) | Identificadores de cuenta | Autenticación y asignación logística | Obligación contractual | Vida útil de la cuenta |

## Datos No Personales

| Campo | Entidad | Observación |
|---|---|---|
| `descripcion`, `codigo`, precios | Artículo | Datos de producto, no personales |
| Montos de factura, IVA | Factura | Datos financieros de la empresa, no personales |
| Estado de reparto, secuencia, resultados de entrega | Reparto / RepartoItem | Metadatos operativos de logística |

## Terceros y red (según módulos)

| Flujo | Cuándo | Qué sale del entorno del operador |
|---|---|---|
| **API propia** | Siempre | Sesión y datos de negocio entre cliente web/escritorio y el servidor BizCode del operador |
| **Geolocation API del navegador** | Chofer en `/logistica/repartos/chofer` con `logistics.gps` y permiso concedido | El dispositivo obtiene coordenadas; el cliente envía `{ lat, lng }` solo a **`POST /api/repartos/{id}/ubicacion`** (opcional si se deniega; no bloquea POD) |
| **CDN de teselas OpenStreetMap** | Planificador en `/logistica/seguimiento` con `logistics.gps` | El navegador solicita teselas del mapa (Leaflet + OSM; sin PII del cliente en la URL) |
| **AFIP / correo** | Solo con integraciones fiscales o notificaciones configuradas | Ver [seguridad.md](seguridad.md) y catálogo de módulos |

Los datos maestros permanecen en **PostgreSQL** bajo control del operador. `logistics.gps` **no** almacena coordenadas de clientes en el esquema actual.

## Derechos del Titular

De conformidad con la Ley 25.326 (Protección de Datos Personales, Argentina), los titulares tienen derecho a:

- **Acceso**: Obtener información sobre los datos almacenados.
- **Rectificación**: Corregir datos inexactos.
- **Supresión**: Solicitar la eliminación de datos no necesarios para el cumplimiento de obligaciones legales.

Para ejercer estos derechos, el operador de la aplicación debe proporcionar un mecanismo de contacto.

## Seguridad de los Datos

- Los datos se almacenan en PostgreSQL; el acceso depende del despliegue (equipo local, LAN corporativa o SaaS según política del operador).
- El acceso a la base de datos se controla mediante credenciales en `.env` (no versionado).
- POD y muestras GPS son filas con `tenantId`; conviene alinear purgas y cierre de reparto con la política de retención del operador.

## Notas de Cumplimiento

- Teselas de mapa y geolocalización del navegador aplican solo con el módulo **`logistics.gps`** habilitado y permiso del usuario.
- No se implementan cookies publicitarias ni seguimiento cross-site en la UI del producto.
- En LAN corporativa o SaaS, el operador es responsable del control de acceso al servidor y de acuerdos con subprocesadores si corresponde.
