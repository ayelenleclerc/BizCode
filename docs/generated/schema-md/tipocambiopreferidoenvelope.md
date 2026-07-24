# TipoCambioPreferidoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TipoCambioPreferidoEnvelope.schema.json](../schema-json/TipoCambioPreferidoEnvelope.schema.json "open original schema") |

## TipoCambioPreferidoEnvelope Type

`object` ([TipoCambioPreferidoEnvelope](tipocambiopreferidoenvelope.md))

# TipoCambioPreferidoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [TipoCambioPreferidoEnvelope](tipocambiopreferidoinput.md "undefined#/properties/data")                          |
| [success](#success) | `boolean` | Required | cannot be null | [TipoCambioPreferidoEnvelope](tipocambiopreferidoenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([TipoCambioPreferidoInput](tipocambiopreferidoinput.md))

* cannot be null

* defined in: [TipoCambioPreferidoEnvelope](tipocambiopreferidoinput.md "undefined#/properties/data")

### data Type

`object` ([TipoCambioPreferidoInput](tipocambiopreferidoinput.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [TipoCambioPreferidoEnvelope](tipocambiopreferidoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `true` |             |
