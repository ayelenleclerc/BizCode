# LiquidacionGenerarEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LiquidacionGenerarEnvelope.schema.json](../schema-json/LiquidacionGenerarEnvelope.schema.json "open original schema") |

## LiquidacionGenerarEnvelope Type

`object` ([LiquidacionGenerarEnvelope](liquidaciongenerarenvelope.md))

# LiquidacionGenerarEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [LiquidacionGenerarEnvelope](liquidaciongenerarenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [LiquidacionGenerarEnvelope](liquidaciongenerarenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Details](liquidaciongenerarenvelope-properties-data.md))

* cannot be null

* defined in: [LiquidacionGenerarEnvelope](liquidaciongenerarenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](liquidaciongenerarenvelope-properties-data.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [LiquidacionGenerarEnvelope](liquidaciongenerarenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `true` |             |
