# PresentacionRetencion Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PresentacionRetencionListEnvelope.schema.json\*](../schema-json/PresentacionRetencionListEnvelope.schema.json "open original schema") |

## items Type

`object` ([PresentacionRetencion](presentacionretencion.md))

# items Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                                             |
| :------------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [archivoHash](#archivohash)           | `string`  | Optional | can be null    | [PresentacionRetencion](presentacionretencion-properties-archivohash.md "undefined#/properties/archivoHash")           |
| [createdAt](#createdat)               | `string`  | Required | cannot be null | [PresentacionRetencion](presentacionretencion-properties-createdat.md "undefined#/properties/createdAt")               |
| [formato](#formato)                   | `string`  | Required | cannot be null | [PresentacionRetencion](presentacionretencion-properties-formato.md "undefined#/properties/formato")                   |
| [id](#id)                             | `integer` | Required | cannot be null | [PresentacionRetencion](presentacionretencion-properties-id.md "undefined#/properties/id")                             |
| [periodo](#periodo)                   | `string`  | Required | cannot be null | [PresentacionRetencion](presentacionretencion-properties-periodo.md "undefined#/properties/periodo")                   |
| [presentadoAt](#presentadoat)         | `string`  | Optional | can be null    | [PresentacionRetencion](presentacionretencion-properties-presentadoat.md "undefined#/properties/presentadoAt")         |
| [totalImporte](#totalimporte)         | `string`  | Required | cannot be null | [PresentacionRetencion](presentacionretencion-properties-totalimporte.md "undefined#/properties/totalImporte")         |
| [totalOperaciones](#totaloperaciones) | `integer` | Required | cannot be null | [PresentacionRetencion](presentacionretencion-properties-totaloperaciones.md "undefined#/properties/totalOperaciones") |

## archivoHash



`archivoHash`

* is optional

* Type: `string`

* can be null

* defined in: [PresentacionRetencion](presentacionretencion-properties-archivohash.md "undefined#/properties/archivoHash")

### archivoHash Type

`string`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionRetencion](presentacionretencion-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## formato



`formato`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionRetencion](presentacionretencion-properties-formato.md "undefined#/properties/formato")

### formato Type

`string`

### formato Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value      | Explanation |
| :--------- | :---------- |
| `"sicore"` |             |
| `"sifere"` |             |

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [PresentacionRetencion](presentacionretencion-properties-id.md "undefined#/properties/id")

### id Type

`integer`

### id Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## periodo



`periodo`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionRetencion](presentacionretencion-properties-periodo.md "undefined#/properties/periodo")

### periodo Type

`string`

## presentadoAt



`presentadoAt`

* is optional

* Type: `string`

* can be null

* defined in: [PresentacionRetencion](presentacionretencion-properties-presentadoat.md "undefined#/properties/presentadoAt")

### presentadoAt Type

`string`

### presentadoAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## totalImporte



`totalImporte`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionRetencion](presentacionretencion-properties-totalimporte.md "undefined#/properties/totalImporte")

### totalImporte Type

`string`

## totalOperaciones



`totalOperaciones`

* is required

* Type: `integer`

* cannot be null

* defined in: [PresentacionRetencion](presentacionretencion-properties-totaloperaciones.md "undefined#/properties/totalOperaciones")

### totalOperaciones Type

`integer`

### totalOperaciones Constraints

**minimum**: the value of this number must greater than or equal to: `0`
