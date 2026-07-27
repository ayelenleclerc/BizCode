# MfaSetupConfirmEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MfaSetupConfirmEnvelope.schema.json](../schema-json/MfaSetupConfirmEnvelope.schema.json "open original schema") |

## MfaSetupConfirmEnvelope Type

`object` ([MfaSetupConfirmEnvelope](mfasetupconfirmenvelope.md))

# MfaSetupConfirmEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [MfaSetupConfirmEnvelope](mfasetupconfirmresult.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [MfaSetupConfirmEnvelope](mfasetupconfirmenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([MfaSetupConfirmResult](mfasetupconfirmresult.md))

* cannot be null

* defined in: [MfaSetupConfirmEnvelope](mfasetupconfirmresult.md "undefined#/properties/data")

### data Type

`object` ([MfaSetupConfirmResult](mfasetupconfirmresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MfaSetupConfirmEnvelope](mfasetupconfirmenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
