# StockAdjustEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [StockAdjustEnvelope.schema.json](../schema-json/StockAdjustEnvelope.schema.json "open original schema") |

## StockAdjustEnvelope Type

`object` ([StockAdjustEnvelope](stockadjustenvelope.md))

# StockAdjustEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [StockAdjustEnvelope](stockadjustdata.md "undefined#/properties/data")                           |
| [success](#success) | `boolean` | Required | cannot be null | [StockAdjustEnvelope](stockadjustenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([StockAdjustData](stockadjustdata.md))

* cannot be null

* defined in: [StockAdjustEnvelope](stockadjustdata.md "undefined#/properties/data")

### data Type

`object` ([StockAdjustData](stockadjustdata.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [StockAdjustEnvelope](stockadjustenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
