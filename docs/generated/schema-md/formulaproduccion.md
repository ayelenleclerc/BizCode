# FormulaProduccion Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FormulaProduccionListEnvelope.schema.json\*](../schema-json/FormulaProduccionListEnvelope.schema.json "open original schema") |

## items Type

`object` ([FormulaProduccion](formulaproduccion.md))

# items Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                                       |
| :-------------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [activa](#activa)                       | `boolean` | Required | cannot be null | [FormulaProduccion](formulaproduccion-properties-activa.md "undefined#/properties/activa")                       |
| [articulo](#articulo)                   | `object`  | Optional | cannot be null | [FormulaProduccion](formulaproduccion-properties-articulo.md "undefined#/properties/articulo")                   |
| [articuloId](#articuloid)               | `integer` | Required | cannot be null | [FormulaProduccion](formulaproduccion-properties-articuloid.md "undefined#/properties/articuloId")               |
| [createdAt](#createdat)                 | `string`  | Required | cannot be null | [FormulaProduccion](formulaproduccion-properties-createdat.md "undefined#/properties/createdAt")                 |
| [id](#id)                               | `integer` | Required | cannot be null | [FormulaProduccion](formulaproduccion-properties-id.md "undefined#/properties/id")                               |
| [insumos](#insumos)                     | `array`   | Required | cannot be null | [FormulaProduccion](formulaproduccion-properties-insumos.md "undefined#/properties/insumos")                     |
| [observaciones](#observaciones)         | `string`  | Required | cannot be null | [FormulaProduccion](formulaproduccion-properties-observaciones.md "undefined#/properties/observaciones")         |
| [rendimiento](#rendimiento)             | `number`  | Required | cannot be null | [FormulaProduccion](formulaproduccion-properties-rendimiento.md "undefined#/properties/rendimiento")             |
| [tenantId](#tenantid)                   | `integer` | Required | cannot be null | [FormulaProduccion](formulaproduccion-properties-tenantid.md "undefined#/properties/tenantId")                   |
| [unidadRendimiento](#unidadrendimiento) | `string`  | Required | cannot be null | [FormulaProduccion](formulaproduccion-properties-unidadrendimiento.md "undefined#/properties/unidadRendimiento") |
| [updatedAt](#updatedat)                 | `string`  | Required | cannot be null | [FormulaProduccion](formulaproduccion-properties-updatedat.md "undefined#/properties/updatedAt")                 |
| [version](#version)                     | `integer` | Required | cannot be null | [FormulaProduccion](formulaproduccion-properties-version.md "undefined#/properties/version")                     |

## activa



`activa`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FormulaProduccion](formulaproduccion-properties-activa.md "undefined#/properties/activa")

### activa Type

`boolean`

## articulo



`articulo`

* is optional

* Type: `object` ([Details](formulaproduccion-properties-articulo.md))

* cannot be null

* defined in: [FormulaProduccion](formulaproduccion-properties-articulo.md "undefined#/properties/articulo")

### articulo Type

`object` ([Details](formulaproduccion-properties-articulo.md))

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [FormulaProduccion](formulaproduccion-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [FormulaProduccion](formulaproduccion-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [FormulaProduccion](formulaproduccion-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## insumos



`insumos`

* is required

* Type: `object[]` ([Details](formulaproduccion-properties-insumos-items.md))

* cannot be null

* defined in: [FormulaProduccion](formulaproduccion-properties-insumos.md "undefined#/properties/insumos")

### insumos Type

`object[]` ([Details](formulaproduccion-properties-insumos-items.md))

## observaciones



`observaciones`

* is required

* Type: `string`

* cannot be null

* defined in: [FormulaProduccion](formulaproduccion-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

## rendimiento



`rendimiento`

* is required

* Type: `number`

* cannot be null

* defined in: [FormulaProduccion](formulaproduccion-properties-rendimiento.md "undefined#/properties/rendimiento")

### rendimiento Type

`number`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [FormulaProduccion](formulaproduccion-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## unidadRendimiento



`unidadRendimiento`

* is required

* Type: `string`

* cannot be null

* defined in: [FormulaProduccion](formulaproduccion-properties-unidadrendimiento.md "undefined#/properties/unidadRendimiento")

### unidadRendimiento Type

`string`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [FormulaProduccion](formulaproduccion-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## version



`version`

* is required

* Type: `integer`

* cannot be null

* defined in: [FormulaProduccion](formulaproduccion-properties-version.md "undefined#/properties/version")

### version Type

`integer`
