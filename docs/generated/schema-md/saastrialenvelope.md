# SaasTrialEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SaasTrialEnvelope.schema.json](../schema-json/SaasTrialEnvelope.schema.json "open original schema") |

## SaasTrialEnvelope Type

`object` ([SaasTrialEnvelope](saastrialenvelope.md))

# SaasTrialEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [SaasTrialEnvelope](saastrialstatus.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [SaasTrialEnvelope](saastrialenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([SaasTrialStatus](saastrialstatus.md))

* cannot be null

* defined in: [SaasTrialEnvelope](saastrialstatus.md "undefined#/properties/data")

### data Type

`object` ([SaasTrialStatus](saastrialstatus.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SaasTrialEnvelope](saastrialenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
