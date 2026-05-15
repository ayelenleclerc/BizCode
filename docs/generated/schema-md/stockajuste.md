# StockAjuste Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [StockAjusteListEnvelope.schema.json\*](../schema-json/StockAjusteListEnvelope.schema.json "open original schema") |

## items Type

`object` ([StockAjuste](stockajuste.md))

# items Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                             |
| :------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------- |
| [articuloId](#articuloid) | `integer` | Optional | cannot be null | [StockAjuste](stockajuste-properties-articuloid.md "undefined#/properties/articuloId") |
| [cantidad](#cantidad)     | `integer` | Optional | cannot be null | [StockAjuste](stockajuste-properties-cantidad.md "undefined#/properties/cantidad")     |
| [createdAt](#createdat)   | `string`  | Optional | cannot be null | [StockAjuste](stockajuste-properties-createdat.md "undefined#/properties/createdAt")   |
| [id](#id)                 | `integer` | Optional | cannot be null | [StockAjuste](stockajuste-properties-id.md "undefined#/properties/id")                 |
| [motivo](#motivo)         | `string`  | Optional | cannot be null | [StockAjuste](stockajuste-properties-motivo.md "undefined#/properties/motivo")         |
| [user](#user)             | `object`  | Optional | cannot be null | [StockAjuste](stockajusteuser.md "undefined#/properties/user")                         |
| [userId](#userid)         | `integer` | Optional | cannot be null | [StockAjuste](stockajuste-properties-userid.md "undefined#/properties/userId")         |
| Additional Properties     | Any       | Optional | can be null    |                                                                                        |

## articuloId



`articuloId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [StockAjuste](stockajuste-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## cantidad



`cantidad`

* is optional

* Type: `integer`

* cannot be null

* defined in: [StockAjuste](stockajuste-properties-cantidad.md "undefined#/properties/cantidad")

### cantidad Type

`integer`

## createdAt



`createdAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [StockAjuste](stockajuste-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [StockAjuste](stockajuste-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## motivo



`motivo`

* is optional

* Type: `string`

* cannot be null

* defined in: [StockAjuste](stockajuste-properties-motivo.md "undefined#/properties/motivo")

### motivo Type

`string`

## user



`user`

* is optional

* Type: `object` ([StockAjusteUser](stockajusteuser.md))

* cannot be null

* defined in: [StockAjuste](stockajusteuser.md "undefined#/properties/user")

### user Type

`object` ([StockAjusteUser](stockajusteuser.md))

## userId



`userId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [StockAjuste](stockajuste-properties-userid.md "undefined#/properties/userId")

### userId Type

`integer`

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
