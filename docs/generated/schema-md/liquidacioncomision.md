# LiquidacionComision Schema

```txt
undefined#/properties/liquidaciones/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MisComisionesResponse.schema.json\*](../schema-json/MisComisionesResponse.schema.json "open original schema") |

## items Type

`object` ([LiquidacionComision](liquidacioncomision.md))

# items Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                                         |
| :------------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [aprobadoPorId](#aprobadoporid)       | `integer` | Required | cannot be null | [LiquidacionComision](liquidacioncomision-properties-aprobadoporid.md "undefined#/properties/aprobadoPorId")       |
| [createdAt](#createdat)               | `string`  | Required | cannot be null | [LiquidacionComision](liquidacioncomision-properties-createdat.md "undefined#/properties/createdAt")               |
| [detalle](#detalle)                   | `array`   | Optional | cannot be null | [LiquidacionComision](liquidacioncomision-properties-detalle.md "undefined#/properties/detalle")                   |
| [estado](#estado)                     | `string`  | Required | cannot be null | [LiquidacionComision](liquidacioncomision-properties-estado.md "undefined#/properties/estado")                     |
| [id](#id)                             | `integer` | Required | cannot be null | [LiquidacionComision](liquidacioncomision-properties-id.md "undefined#/properties/id")                             |
| [pagadoEn](#pagadoen)                 | `string`  | Required | cannot be null | [LiquidacionComision](liquidacioncomision-properties-pagadoen.md "undefined#/properties/pagadoEn")                 |
| [periodo](#periodo)                   | `string`  | Required | cannot be null | [LiquidacionComision](liquidacioncomision-properties-periodo.md "undefined#/properties/periodo")                   |
| [tenantId](#tenantid)                 | `integer` | Required | cannot be null | [LiquidacionComision](liquidacioncomision-properties-tenantid.md "undefined#/properties/tenantId")                 |
| [totalComision](#totalcomision)       | `number`  | Required | cannot be null | [LiquidacionComision](liquidacioncomision-properties-totalcomision.md "undefined#/properties/totalComision")       |
| [totalVentas](#totalventas)           | `number`  | Required | cannot be null | [LiquidacionComision](liquidacioncomision-properties-totalventas.md "undefined#/properties/totalVentas")           |
| [updatedAt](#updatedat)               | `string`  | Required | cannot be null | [LiquidacionComision](liquidacioncomision-properties-updatedat.md "undefined#/properties/updatedAt")               |
| [vendedorId](#vendedorid)             | `integer` | Required | cannot be null | [LiquidacionComision](liquidacioncomision-properties-vendedorid.md "undefined#/properties/vendedorId")             |
| [vendedorUsername](#vendedorusername) | `string`  | Optional | cannot be null | [LiquidacionComision](liquidacioncomision-properties-vendedorusername.md "undefined#/properties/vendedorUsername") |

## aprobadoPorId



`aprobadoPorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [LiquidacionComision](liquidacioncomision-properties-aprobadoporid.md "undefined#/properties/aprobadoPorId")

### aprobadoPorId Type

`integer`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [LiquidacionComision](liquidacioncomision-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## detalle



`detalle`

* is optional

* Type: `object[]` ([LiquidacionComisionDetalle](liquidacioncomisiondetalle.md))

* cannot be null

* defined in: [LiquidacionComision](liquidacioncomision-properties-detalle.md "undefined#/properties/detalle")

### detalle Type

`object[]` ([LiquidacionComisionDetalle](liquidacioncomisiondetalle.md))

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [LiquidacionComision](liquidacioncomision-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"borrador"` |             |
| `"aprobada"` |             |
| `"pagada"`   |             |

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [LiquidacionComision](liquidacioncomision-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## pagadoEn



`pagadoEn`

* is required

* Type: `string`

* cannot be null

* defined in: [LiquidacionComision](liquidacioncomision-properties-pagadoen.md "undefined#/properties/pagadoEn")

### pagadoEn Type

`string`

### pagadoEn Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## periodo



`periodo`

* is required

* Type: `string`

* cannot be null

* defined in: [LiquidacionComision](liquidacioncomision-properties-periodo.md "undefined#/properties/periodo")

### periodo Type

`string`

### periodo Constraints

**pattern**: the string must match the following regular expression:&#x20;

```regexp
^\d{4}-\d{2}$
```

[try pattern](https://regexr.com/?expression=%5E%5Cd%7B4%7D-%5Cd%7B2%7D%24 "try regular expression with regexr.com")

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [LiquidacionComision](liquidacioncomision-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## totalComision



`totalComision`

* is required

* Type: `number`

* cannot be null

* defined in: [LiquidacionComision](liquidacioncomision-properties-totalcomision.md "undefined#/properties/totalComision")

### totalComision Type

`number`

## totalVentas



`totalVentas`

* is required

* Type: `number`

* cannot be null

* defined in: [LiquidacionComision](liquidacioncomision-properties-totalventas.md "undefined#/properties/totalVentas")

### totalVentas Type

`number`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [LiquidacionComision](liquidacioncomision-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## vendedorId



`vendedorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [LiquidacionComision](liquidacioncomision-properties-vendedorid.md "undefined#/properties/vendedorId")

### vendedorId Type

`integer`

## vendedorUsername



`vendedorUsername`

* is optional

* Type: `string`

* cannot be null

* defined in: [LiquidacionComision](liquidacioncomision-properties-vendedorusername.md "undefined#/properties/vendedorUsername")

### vendedorUsername Type

`string`
