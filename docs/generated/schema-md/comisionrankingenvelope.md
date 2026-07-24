# ComisionRankingEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ComisionRankingEnvelope.schema.json](../schema-json/ComisionRankingEnvelope.schema.json "open original schema") |

## ComisionRankingEnvelope Type

`object` ([ComisionRankingEnvelope](comisionrankingenvelope.md))

# ComisionRankingEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [ComisionRankingEnvelope](comisionrankingenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [ComisionRankingEnvelope](comisionrankingenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([ComisionRankingRow](comisionrankingrow.md))

* cannot be null

* defined in: [ComisionRankingEnvelope](comisionrankingenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([ComisionRankingRow](comisionrankingrow.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ComisionRankingEnvelope](comisionrankingenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `true` |             |
