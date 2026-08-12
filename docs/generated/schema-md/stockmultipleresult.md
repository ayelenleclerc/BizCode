# StockMultipleResult Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [StockMultipleResult.schema.json](../schema-json/StockMultipleResult.schema.json "open original schema") |

## StockMultipleResult Type

`object` ([StockMultipleResult](stockmultipleresult.md))

# StockMultipleResult Properties

| Property        | Type     | Required | Nullable       | Defined by                                                                                   |
| :-------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [asOf](#asof)   | `string` | Required | cannot be null | [StockMultipleResult](stockmultipleresult-properties-asof.md "undefined#/properties/asOf")   |
| [items](#items) | `array`  | Required | cannot be null | [StockMultipleResult](stockmultipleresult-properties-items.md "undefined#/properties/items") |

## asOf



`asOf`

* is required

* Type: `string`

* cannot be null

* defined in: [StockMultipleResult](stockmultipleresult-properties-asof.md "undefined#/properties/asOf")

### asOf Type

`string`

### asOf Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## items



`items`

* is required

* Type: `object[]` ([StockMultipleItem](stockmultipleitem.md))

* cannot be null

* defined in: [StockMultipleResult](stockmultipleresult-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([StockMultipleItem](stockmultipleitem.md))
