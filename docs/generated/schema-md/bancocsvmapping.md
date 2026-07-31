# BancoCsvMapping Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [BancoCsvMappingEnvelope.schema.json\*](../schema-json/BancoCsvMappingEnvelope.schema.json "open original schema") |

## data Type

`object` ([BancoCsvMapping](bancocsvmapping.md))

# data Properties

| Property                                  | Type      | Required | Nullable       | Defined by                                                                                                     |
| :---------------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [bancoCode](#bancocode)                   | `string`  | Required | cannot be null | [BancoCsvMapping](bancocsvmapping-properties-bancocode.md "undefined#/properties/bancoCode")                   |
| [columnaDescripcion](#columnadescripcion) | `string`  | Required | cannot be null | [BancoCsvMapping](bancocsvmapping-properties-columnadescripcion.md "undefined#/properties/columnaDescripcion") |
| [columnaFecha](#columnafecha)             | `string`  | Required | cannot be null | [BancoCsvMapping](bancocsvmapping-properties-columnafecha.md "undefined#/properties/columnaFecha")             |
| [columnaImporte](#columnaimporte)         | `string`  | Required | cannot be null | [BancoCsvMapping](bancocsvmapping-properties-columnaimporte.md "undefined#/properties/columnaImporte")         |
| [columnaReferencia](#columnareferencia)   | `string`  | Optional | cannot be null | [BancoCsvMapping](bancocsvmapping-properties-columnareferencia.md "undefined#/properties/columnaReferencia")   |
| [columnaSaldo](#columnasaldo)             | `string`  | Optional | cannot be null | [BancoCsvMapping](bancocsvmapping-properties-columnasaldo.md "undefined#/properties/columnaSaldo")             |
| [createdAt](#createdat)                   | `string`  | Required | cannot be null | [BancoCsvMapping](bancocsvmapping-properties-createdat.md "undefined#/properties/createdAt")                   |
| [delimiter](#delimiter)                   | `string`  | Required | cannot be null | [BancoCsvMapping](bancocsvmapping-properties-delimiter.md "undefined#/properties/delimiter")                   |
| [formatoFecha](#formatofecha)             | `string`  | Required | cannot be null | [BancoCsvMapping](bancocsvmapping-properties-formatofecha.md "undefined#/properties/formatoFecha")             |
| [id](#id)                                 | `integer` | Required | cannot be null | [BancoCsvMapping](bancocsvmapping-properties-id.md "undefined#/properties/id")                                 |
| [separadorDecimal](#separadordecimal)     | `string`  | Required | cannot be null | [BancoCsvMapping](bancocsvmapping-properties-separadordecimal.md "undefined#/properties/separadorDecimal")     |
| [signoDebitoCredito](#signodebitocredito) | `string`  | Required | cannot be null | [BancoCsvMapping](bancocsvmapping-properties-signodebitocredito.md "undefined#/properties/signoDebitoCredito") |
| [tenantId](#tenantid)                     | `integer` | Required | cannot be null | [BancoCsvMapping](bancocsvmapping-properties-tenantid.md "undefined#/properties/tenantId")                     |
| [updatedAt](#updatedat)                   | `string`  | Required | cannot be null | [BancoCsvMapping](bancocsvmapping-properties-updatedat.md "undefined#/properties/updatedAt")                   |

## bancoCode



`bancoCode`

* is required

* Type: `string`

* cannot be null

* defined in: [BancoCsvMapping](bancocsvmapping-properties-bancocode.md "undefined#/properties/bancoCode")

### bancoCode Type

`string`

## columnaDescripcion



`columnaDescripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [BancoCsvMapping](bancocsvmapping-properties-columnadescripcion.md "undefined#/properties/columnaDescripcion")

### columnaDescripcion Type

`string`

## columnaFecha



`columnaFecha`

* is required

* Type: `string`

* cannot be null

* defined in: [BancoCsvMapping](bancocsvmapping-properties-columnafecha.md "undefined#/properties/columnaFecha")

### columnaFecha Type

`string`

## columnaImporte



`columnaImporte`

* is required

* Type: `string`

* cannot be null

* defined in: [BancoCsvMapping](bancocsvmapping-properties-columnaimporte.md "undefined#/properties/columnaImporte")

### columnaImporte Type

`string`

## columnaReferencia



`columnaReferencia`

* is optional

* Type: `string`

* cannot be null

* defined in: [BancoCsvMapping](bancocsvmapping-properties-columnareferencia.md "undefined#/properties/columnaReferencia")

### columnaReferencia Type

`string`

## columnaSaldo



`columnaSaldo`

* is optional

* Type: `string`

* cannot be null

* defined in: [BancoCsvMapping](bancocsvmapping-properties-columnasaldo.md "undefined#/properties/columnaSaldo")

### columnaSaldo Type

`string`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [BancoCsvMapping](bancocsvmapping-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## delimiter



`delimiter`

* is required

* Type: `string`

* cannot be null

* defined in: [BancoCsvMapping](bancocsvmapping-properties-delimiter.md "undefined#/properties/delimiter")

### delimiter Type

`string`

## formatoFecha



`formatoFecha`

* is required

* Type: `string`

* cannot be null

* defined in: [BancoCsvMapping](bancocsvmapping-properties-formatofecha.md "undefined#/properties/formatoFecha")

### formatoFecha Type

`string`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [BancoCsvMapping](bancocsvmapping-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## separadorDecimal



`separadorDecimal`

* is required

* Type: `string`

* cannot be null

* defined in: [BancoCsvMapping](bancocsvmapping-properties-separadordecimal.md "undefined#/properties/separadorDecimal")

### separadorDecimal Type

`string`

## signoDebitoCredito



`signoDebitoCredito`

* is required

* Type: `string`

* cannot be null

* defined in: [BancoCsvMapping](bancocsvmapping-properties-signodebitocredito.md "undefined#/properties/signoDebitoCredito")

### signoDebitoCredito Type

`string`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [BancoCsvMapping](bancocsvmapping-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [BancoCsvMapping](bancocsvmapping-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
