# TipoCambioEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TipoCambioEnvelope.schema.json](../schema-json/TipoCambioEnvelope.schema.json "open original schema") |

## TipoCambioEnvelope Type

`object` ([TipoCambioEnvelope](tipocambioenvelope.md))

# TipoCambioEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [TipoCambioEnvelope](tipocambio.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [TipoCambioEnvelope](tipocambioenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([TipoCambio](tipocambio.md))

* cannot be null

* defined in: [TipoCambioEnvelope](tipocambio.md "undefined#/properties/data")

### data Type

`object` ([TipoCambio](tipocambio.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [TipoCambioEnvelope](tipocambioenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `true` |             |
