# LiquidacionComisionEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LiquidacionComisionEnvelope.schema.json](../schema-json/LiquidacionComisionEnvelope.schema.json "open original schema") |

## LiquidacionComisionEnvelope Type

`object` ([LiquidacionComisionEnvelope](liquidacioncomisionenvelope.md))

# LiquidacionComisionEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [LiquidacionComisionEnvelope](liquidacioncomision.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [LiquidacionComisionEnvelope](liquidacioncomisionenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([LiquidacionComision](liquidacioncomision.md))

* cannot be null

* defined in: [LiquidacionComisionEnvelope](liquidacioncomision.md "undefined#/properties/data")

### data Type

`object` ([LiquidacionComision](liquidacioncomision.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [LiquidacionComisionEnvelope](liquidacioncomisionenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `true` |             |
