# StockAdjustData Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [StockAdjustEnvelope.schema.json\*](../schema-json/StockAdjustEnvelope.schema.json "open original schema") |

## data Type

`object` ([StockAdjustData](stockadjustdata.md))

# data Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                       |
| :-------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [ajuste](#ajuste)           | `object`  | Optional | cannot be null | [StockAdjustData](stockajuste.md "undefined#/properties/ajuste")                                 |
| [articulo](#articulo)       | `object`  | Optional | cannot be null | [StockAdjustData](stockadjustdata-properties-articulo.md "undefined#/properties/articulo")       |
| [stockAfter](#stockafter)   | `integer` | Optional | cannot be null | [StockAdjustData](stockadjustdata-properties-stockafter.md "undefined#/properties/stockAfter")   |
| [stockBefore](#stockbefore) | `integer` | Optional | cannot be null | [StockAdjustData](stockadjustdata-properties-stockbefore.md "undefined#/properties/stockBefore") |
| Additional Properties       | Any       | Optional | can be null    |                                                                                                  |

## ajuste



`ajuste`

* is optional

* Type: `object` ([StockAjuste](stockajuste.md))

* cannot be null

* defined in: [StockAdjustData](stockajuste.md "undefined#/properties/ajuste")

### ajuste Type

`object` ([StockAjuste](stockajuste.md))

## articulo



`articulo`

* is optional

* Type: `object` ([Details](stockadjustdata-properties-articulo.md))

* cannot be null

* defined in: [StockAdjustData](stockadjustdata-properties-articulo.md "undefined#/properties/articulo")

### articulo Type

`object` ([Details](stockadjustdata-properties-articulo.md))

## stockAfter



`stockAfter`

* is optional

* Type: `integer`

* cannot be null

* defined in: [StockAdjustData](stockadjustdata-properties-stockafter.md "undefined#/properties/stockAfter")

### stockAfter Type

`integer`

## stockBefore



`stockBefore`

* is optional

* Type: `integer`

* cannot be null

* defined in: [StockAdjustData](stockadjustdata-properties-stockbefore.md "undefined#/properties/stockBefore")

### stockBefore Type

`integer`

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
