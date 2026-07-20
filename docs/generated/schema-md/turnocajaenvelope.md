# TurnoCajaEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TurnoCajaEnvelope.schema.json](../schema-json/TurnoCajaEnvelope.schema.json "open original schema") |

## TurnoCajaEnvelope Type

`object` ([TurnoCajaEnvelope](turnocajaenvelope.md))

# TurnoCajaEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [TurnoCajaEnvelope](turnocaja.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [TurnoCajaEnvelope](turnocajaenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([TurnoCaja](turnocaja.md))

* cannot be null

* defined in: [TurnoCajaEnvelope](turnocaja.md "undefined#/properties/data")

### data Type

`object` ([TurnoCaja](turnocaja.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [TurnoCajaEnvelope](turnocajaenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
