# MfaStatusEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MfaStatusEnvelope.schema.json](../schema-json/MfaStatusEnvelope.schema.json "open original schema") |

## MfaStatusEnvelope Type

`object` ([MfaStatusEnvelope](mfastatusenvelope.md))

# MfaStatusEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [MfaStatusEnvelope](mfastatusresult.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [MfaStatusEnvelope](mfastatusenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([MfaStatusResult](mfastatusresult.md))

* cannot be null

* defined in: [MfaStatusEnvelope](mfastatusresult.md "undefined#/properties/data")

### data Type

`object` ([MfaStatusResult](mfastatusresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MfaStatusEnvelope](mfastatusenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
