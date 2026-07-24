# TipoCambioMutationEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TipoCambioMutationEnvelope.schema.json](../schema-json/TipoCambioMutationEnvelope.schema.json "open original schema") |

## TipoCambioMutationEnvelope Type

`object` ([TipoCambioMutationEnvelope](tipocambiomutationenvelope.md))

# TipoCambioMutationEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [TipoCambioMutationEnvelope](tipocambio.md "undefined#/properties/data")                                       |
| [recalc](#recalc)   | `object`  | Optional | cannot be null | [TipoCambioMutationEnvelope](recalcfxresult.md "undefined#/properties/recalc")                                 |
| [success](#success) | `boolean` | Required | cannot be null | [TipoCambioMutationEnvelope](tipocambiomutationenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([TipoCambio](tipocambio.md))

* cannot be null

* defined in: [TipoCambioMutationEnvelope](tipocambio.md "undefined#/properties/data")

### data Type

`object` ([TipoCambio](tipocambio.md))

## recalc



`recalc`

* is optional

* Type: `object` ([RecalcFxResult](recalcfxresult.md))

* cannot be null

* defined in: [TipoCambioMutationEnvelope](recalcfxresult.md "undefined#/properties/recalc")

### recalc Type

`object` ([RecalcFxResult](recalcfxresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [TipoCambioMutationEnvelope](tipocambiomutationenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `true` |             |
