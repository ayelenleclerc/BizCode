# StockDeposito Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [StockDeposito.schema.json](../schema-json/StockDeposito.schema.json "open original schema") |

## StockDeposito Type

`object` ([StockDeposito](stockdeposito.md))

# StockDeposito Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                         |
| :-------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)         | `integer` | Required | cannot be null | [StockDeposito](stockdeposito-properties-articuloid.md "undefined#/properties/articuloId")         |
| [cantidad](#cantidad)             | `integer` | Required | cannot be null | [StockDeposito](stockdeposito-properties-cantidad.md "undefined#/properties/cantidad")             |
| [createdAt](#createdat)           | `string`  | Required | cannot be null | [StockDeposito](stockdeposito-properties-createdat.md "undefined#/properties/createdAt")           |
| [depositoCodigo](#depositocodigo) | `string`  | Optional | cannot be null | [StockDeposito](stockdeposito-properties-depositocodigo.md "undefined#/properties/depositoCodigo") |
| [depositoId](#depositoid)         | `integer` | Required | cannot be null | [StockDeposito](stockdeposito-properties-depositoid.md "undefined#/properties/depositoId")         |
| [depositoNombre](#depositonombre) | `string`  | Optional | cannot be null | [StockDeposito](stockdeposito-properties-depositonombre.md "undefined#/properties/depositoNombre") |
| [id](#id)                         | `integer` | Required | cannot be null | [StockDeposito](stockdeposito-properties-id.md "undefined#/properties/id")                         |
| [stockMax](#stockmax)             | `integer` | Required | cannot be null | [StockDeposito](stockdeposito-properties-stockmax.md "undefined#/properties/stockMax")             |
| [stockMin](#stockmin)             | `integer` | Required | cannot be null | [StockDeposito](stockdeposito-properties-stockmin.md "undefined#/properties/stockMin")             |
| [tenantId](#tenantid)             | `integer` | Required | cannot be null | [StockDeposito](stockdeposito-properties-tenantid.md "undefined#/properties/tenantId")             |
| [updatedAt](#updatedat)           | `string`  | Required | cannot be null | [StockDeposito](stockdeposito-properties-updatedat.md "undefined#/properties/updatedAt")           |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [StockDeposito](stockdeposito-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## cantidad



`cantidad`

* is required

* Type: `integer`

* cannot be null

* defined in: [StockDeposito](stockdeposito-properties-cantidad.md "undefined#/properties/cantidad")

### cantidad Type

`integer`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [StockDeposito](stockdeposito-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## depositoCodigo



`depositoCodigo`

* is optional

* Type: `string`

* cannot be null

* defined in: [StockDeposito](stockdeposito-properties-depositocodigo.md "undefined#/properties/depositoCodigo")

### depositoCodigo Type

`string`

## depositoId



`depositoId`

* is required

* Type: `integer`

* cannot be null

* defined in: [StockDeposito](stockdeposito-properties-depositoid.md "undefined#/properties/depositoId")

### depositoId Type

`integer`

## depositoNombre



`depositoNombre`

* is optional

* Type: `string`

* cannot be null

* defined in: [StockDeposito](stockdeposito-properties-depositonombre.md "undefined#/properties/depositoNombre")

### depositoNombre Type

`string`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [StockDeposito](stockdeposito-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## stockMax



`stockMax`

* is required

* Type: `integer`

* cannot be null

* defined in: [StockDeposito](stockdeposito-properties-stockmax.md "undefined#/properties/stockMax")

### stockMax Type

`integer`

## stockMin



`stockMin`

* is required

* Type: `integer`

* cannot be null

* defined in: [StockDeposito](stockdeposito-properties-stockmin.md "undefined#/properties/stockMin")

### stockMin Type

`integer`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [StockDeposito](stockdeposito-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [StockDeposito](stockdeposito-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
