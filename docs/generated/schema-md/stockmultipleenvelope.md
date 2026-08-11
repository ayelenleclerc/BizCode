# StockMultipleEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [StockMultipleEnvelope.schema.json](../schema-json/StockMultipleEnvelope.schema.json "open original schema") |

## StockMultipleEnvelope Type

`object` ([StockMultipleEnvelope](stockmultipleenvelope.md))

# StockMultipleEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [StockMultipleEnvelope](stockmultipleresult.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [StockMultipleEnvelope](stockmultipleenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([StockMultipleResult](stockmultipleresult.md))

* cannot be null

* defined in: [StockMultipleEnvelope](stockmultipleresult.md "undefined#/properties/data")

### data Type

`object` ([StockMultipleResult](stockmultipleresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [StockMultipleEnvelope](stockmultipleenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
