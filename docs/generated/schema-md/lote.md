# Lote Schema

```txt
undefined#/properties/lote
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LoteTrazabilidad.schema.json\*](../schema-json/LoteTrazabilidad.schema.json "open original schema") |

## lote Type

`object` ([Lote](lote.md))

# lote Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                             |
| :-------------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------- |
| [activo](#activo)                       | `boolean` | Required | cannot be null | [Lote](lote-properties-activo.md "undefined#/properties/activo")                       |
| [articuloId](#articuloid)               | `integer` | Required | cannot be null | [Lote](lote-properties-articuloid.md "undefined#/properties/articuloId")               |
| [createdAt](#createdat)                 | `string`  | Required | cannot be null | [Lote](lote-properties-createdat.md "undefined#/properties/createdAt")                 |
| [depositoId](#depositoid)               | `integer` | Required | cannot be null | [Lote](lote-properties-depositoid.md "undefined#/properties/depositoId")               |
| [fechaIngreso](#fechaingreso)           | `string`  | Required | cannot be null | [Lote](lote-properties-fechaingreso.md "undefined#/properties/fechaIngreso")           |
| [fechaVencimiento](#fechavencimiento)   | `string`  | Required | cannot be null | [Lote](lote-properties-fechavencimiento.md "undefined#/properties/fechaVencimiento")   |
| [id](#id)                               | `integer` | Required | cannot be null | [Lote](lote-properties-id.md "undefined#/properties/id")                               |
| [nroLote](#nrolote)                     | `string`  | Required | cannot be null | [Lote](lote-properties-nrolote.md "undefined#/properties/nroLote")                     |
| [preavisoEnviadoAt](#preavisoenviadoat) | `string`  | Optional | cannot be null | [Lote](lote-properties-preavisoenviadoat.md "undefined#/properties/preavisoEnviadoAt") |
| [proveedorId](#proveedorid)             | `integer` | Optional | cannot be null | [Lote](lote-properties-proveedorid.md "undefined#/properties/proveedorId")             |
| [stockActual](#stockactual)             | `integer` | Required | cannot be null | [Lote](lote-properties-stockactual.md "undefined#/properties/stockActual")             |
| [stockInicial](#stockinicial)           | `integer` | Required | cannot be null | [Lote](lote-properties-stockinicial.md "undefined#/properties/stockInicial")           |
| [tenantId](#tenantid)                   | `integer` | Required | cannot be null | [Lote](lote-properties-tenantid.md "undefined#/properties/tenantId")                   |
| [updatedAt](#updatedat)                 | `string`  | Required | cannot be null | [Lote](lote-properties-updatedat.md "undefined#/properties/updatedAt")                 |

## activo



`activo`

* is required

* Type: `boolean`

* cannot be null

* defined in: [Lote](lote-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [Lote](lote-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [Lote](lote-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## depositoId



`depositoId`

* is required

* Type: `integer`

* cannot be null

* defined in: [Lote](lote-properties-depositoid.md "undefined#/properties/depositoId")

### depositoId Type

`integer`

## fechaIngreso



`fechaIngreso`

* is required

* Type: `string`

* cannot be null

* defined in: [Lote](lote-properties-fechaingreso.md "undefined#/properties/fechaIngreso")

### fechaIngreso Type

`string`

### fechaIngreso Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## fechaVencimiento



`fechaVencimiento`

* is required

* Type: `string`

* cannot be null

* defined in: [Lote](lote-properties-fechavencimiento.md "undefined#/properties/fechaVencimiento")

### fechaVencimiento Type

`string`

### fechaVencimiento Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [Lote](lote-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## nroLote



`nroLote`

* is required

* Type: `string`

* cannot be null

* defined in: [Lote](lote-properties-nrolote.md "undefined#/properties/nroLote")

### nroLote Type

`string`

## preavisoEnviadoAt



`preavisoEnviadoAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [Lote](lote-properties-preavisoenviadoat.md "undefined#/properties/preavisoEnviadoAt")

### preavisoEnviadoAt Type

`string`

### preavisoEnviadoAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## proveedorId



`proveedorId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Lote](lote-properties-proveedorid.md "undefined#/properties/proveedorId")

### proveedorId Type

`integer`

## stockActual



`stockActual`

* is required

* Type: `integer`

* cannot be null

* defined in: [Lote](lote-properties-stockactual.md "undefined#/properties/stockActual")

### stockActual Type

`integer`

## stockInicial



`stockInicial`

* is required

* Type: `integer`

* cannot be null

* defined in: [Lote](lote-properties-stockinicial.md "undefined#/properties/stockInicial")

### stockInicial Type

`integer`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [Lote](lote-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [Lote](lote-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
