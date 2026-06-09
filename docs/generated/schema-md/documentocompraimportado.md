# DocumentoCompraImportado Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DocumentoCompraImportadoListEnvelope.schema.json\*](../schema-json/DocumentoCompraImportadoListEnvelope.schema.json "open original schema") |

## items Type

`object` ([DocumentoCompraImportado](documentocompraimportado.md))

# items Properties

| Property                                    | Type      | Required | Nullable       | Defined by                                                                                                                         |
| :------------------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| [archivoMime](#archivomime)                 | `string`  | Required | cannot be null | [DocumentoCompraImportado](documentocompraimportado-properties-archivomime.md "undefined#/properties/archivoMime")                 |
| [archivoNombre](#archivonombre)             | `string`  | Required | cannot be null | [DocumentoCompraImportado](documentocompraimportado-properties-archivonombre.md "undefined#/properties/archivoNombre")             |
| [archivoPath](#archivopath)                 | `string`  | Required | cannot be null | [DocumentoCompraImportado](documentocompraimportado-properties-archivopath.md "undefined#/properties/archivoPath")                 |
| [comprobanteCompraId](#comprobantecompraid) | `integer` | Optional | cannot be null | [DocumentoCompraImportado](documentocompraimportado-properties-comprobantecompraid.md "undefined#/properties/comprobanteCompraId") |
| [confianza](#confianza)                     | `number`  | Required | cannot be null | [DocumentoCompraImportado](documentocompraimportado-properties-confianza.md "undefined#/properties/confianza")                     |
| [createdAt](#createdat)                     | `string`  | Required | cannot be null | [DocumentoCompraImportado](documentocompraimportado-properties-createdat.md "undefined#/properties/createdAt")                     |
| [datosExtraidos](#datosextraidos)           | `object`  | Required | cannot be null | [DocumentoCompraImportado](documentocomprapreviewdata.md "undefined#/properties/datosExtraidos")                                   |
| [errores](#errores)                         | `object`  | Optional | cannot be null | [DocumentoCompraImportado](documentocompraimportado-properties-errores.md "undefined#/properties/errores")                         |
| [estado](#estado)                           | `string`  | Required | cannot be null | [DocumentoCompraImportado](documentocompraimportado-properties-estado.md "undefined#/properties/estado")                           |
| [id](#id)                                   | `integer` | Required | cannot be null | [DocumentoCompraImportado](documentocompraimportado-properties-id.md "undefined#/properties/id")                                   |
| [tenantId](#tenantid)                       | `integer` | Required | cannot be null | [DocumentoCompraImportado](documentocompraimportado-properties-tenantid.md "undefined#/properties/tenantId")                       |
| [tier](#tier)                               | `integer` | Required | cannot be null | [DocumentoCompraImportado](documentocompraimportado-properties-tier.md "undefined#/properties/tier")                               |
| [tipoArchivo](#tipoarchivo)                 | `string`  | Required | cannot be null | [DocumentoCompraImportado](documentocompraimportado-properties-tipoarchivo.md "undefined#/properties/tipoArchivo")                 |
| [updatedAt](#updatedat)                     | `string`  | Required | cannot be null | [DocumentoCompraImportado](documentocompraimportado-properties-updatedat.md "undefined#/properties/updatedAt")                     |
| [usuarioId](#usuarioid)                     | `integer` | Required | cannot be null | [DocumentoCompraImportado](documentocompraimportado-properties-usuarioid.md "undefined#/properties/usuarioId")                     |

## archivoMime



`archivoMime`

* is required

* Type: `string`

* cannot be null

* defined in: [DocumentoCompraImportado](documentocompraimportado-properties-archivomime.md "undefined#/properties/archivoMime")

### archivoMime Type

`string`

## archivoNombre



`archivoNombre`

* is required

* Type: `string`

* cannot be null

* defined in: [DocumentoCompraImportado](documentocompraimportado-properties-archivonombre.md "undefined#/properties/archivoNombre")

### archivoNombre Type

`string`

## archivoPath



`archivoPath`

* is required

* Type: `string`

* cannot be null

* defined in: [DocumentoCompraImportado](documentocompraimportado-properties-archivopath.md "undefined#/properties/archivoPath")

### archivoPath Type

`string`

## comprobanteCompraId



`comprobanteCompraId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [DocumentoCompraImportado](documentocompraimportado-properties-comprobantecompraid.md "undefined#/properties/comprobanteCompraId")

### comprobanteCompraId Type

`integer`

## confianza



`confianza`

* is required

* Type: `number`

* cannot be null

* defined in: [DocumentoCompraImportado](documentocompraimportado-properties-confianza.md "undefined#/properties/confianza")

### confianza Type

`number`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [DocumentoCompraImportado](documentocompraimportado-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## datosExtraidos



`datosExtraidos`

* is required

* Type: `object` ([DocumentoCompraPreviewData](documentocomprapreviewdata.md))

* cannot be null

* defined in: [DocumentoCompraImportado](documentocomprapreviewdata.md "undefined#/properties/datosExtraidos")

### datosExtraidos Type

`object` ([DocumentoCompraPreviewData](documentocomprapreviewdata.md))

## errores



`errores`

* is optional

* Type: `object` ([Details](documentocompraimportado-properties-errores.md))

* cannot be null

* defined in: [DocumentoCompraImportado](documentocompraimportado-properties-errores.md "undefined#/properties/errores")

### errores Type

`object` ([Details](documentocompraimportado-properties-errores.md))

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [DocumentoCompraImportado](documentocompraimportado-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                  | Explanation |
| :--------------------- | :---------- |
| `"procesando"`         |             |
| `"pendiente_revision"` |             |
| `"confirmado"`         |             |
| `"descartado"`         |             |

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [DocumentoCompraImportado](documentocompraimportado-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [DocumentoCompraImportado](documentocompraimportado-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## tier



`tier`

* is required

* Type: `integer`

* cannot be null

* defined in: [DocumentoCompraImportado](documentocompraimportado-properties-tier.md "undefined#/properties/tier")

### tier Type

`integer`

## tipoArchivo



`tipoArchivo`

* is required

* Type: `string`

* cannot be null

* defined in: [DocumentoCompraImportado](documentocompraimportado-properties-tipoarchivo.md "undefined#/properties/tipoArchivo")

### tipoArchivo Type

`string`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [DocumentoCompraImportado](documentocompraimportado-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## usuarioId



`usuarioId`

* is required

* Type: `integer`

* cannot be null

* defined in: [DocumentoCompraImportado](documentocompraimportado-properties-usuarioid.md "undefined#/properties/usuarioId")

### usuarioId Type

`integer`
