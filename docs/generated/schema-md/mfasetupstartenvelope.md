# MfaSetupStartEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MfaSetupStartEnvelope.schema.json](../schema-json/MfaSetupStartEnvelope.schema.json "open original schema") |

## MfaSetupStartEnvelope Type

`object` ([MfaSetupStartEnvelope](mfasetupstartenvelope.md))

# MfaSetupStartEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [MfaSetupStartEnvelope](mfasetupstartresult.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [MfaSetupStartEnvelope](mfasetupstartenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([MfaSetupStartResult](mfasetupstartresult.md))

* cannot be null

* defined in: [MfaSetupStartEnvelope](mfasetupstartresult.md "undefined#/properties/data")

### data Type

`object` ([MfaSetupStartResult](mfasetupstartresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MfaSetupStartEnvelope](mfasetupstartenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
