# Mapa de Datos Personales

## Inventario de Datos

| Campo | Entidad | Tipo | Propósito | Base legal | Retención |
|---|---|---|---|---|---|
| `rsocial` (Razón Social) | Cliente | Nombre de empresa o persona | Identificación en facturas | Obligación contractual | Duración de la relación comercial + 10 años (prescripción fiscal) |
| `cuit` (CUIT/CUIL) | Cliente | Identificador fiscal argentino | Facturación legal; validación ARCA | Obligación legal (Res. Gral. 1415, ARCA) | 10 años |
| `email` | Cliente | Dirección de correo electrónico | Comunicaciones comerciales (opcional) | Consentimiento | Hasta solicitud de eliminación |
| `domicilio`, `localidad`, `cpost` | Cliente | Dirección postal | Domicilio fiscal en facturas | Obligación contractual | 10 años |
| `telef` | Cliente | Número de teléfono | Contacto comercial (opcional) | Consentimiento | Hasta solicitud de eliminación |

## Datos No Personales

| Campo | Entidad | Observación |
|---|---|---|
| `descripcion`, `codigo`, precios | Artículo | Datos de producto, no personales |
| Montos de factura, IVA | Factura | Datos financieros de la empresa, no personales |

## Derechos del Titular

De conformidad con la Ley 25.326 (Protección de Datos Personales, Argentina), los titulares tienen derecho a:

- **Acceso**: Obtener información sobre los datos almacenados.
- **Rectificación**: Corregir datos inexactos.
- **Supresión**: Solicitar la eliminación de datos no necesarios para el cumplimiento de obligaciones legales.

Para ejercer estos derechos, el operador de la aplicación debe proporcionar un mecanismo de contacto.

## Seguridad de los Datos

- Los datos se almacenan localmente en PostgreSQL, accesible solo desde el equipo del operador.
- No se transmiten datos personales a servidores externos.
- El acceso a la base de datos se controla mediante credenciales en `.env` (no versionado).

## Notas de Cumplimiento

- La aplicación no envía datos a terceros ni utiliza servicios en la nube.
- No se implementan cookies ni seguimiento.
- Para uso en red local corporativa, el operador es responsable del control de acceso al servidor.
