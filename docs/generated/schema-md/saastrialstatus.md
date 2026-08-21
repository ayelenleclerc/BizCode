# SaasTrialStatus Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SaasTrialStatus.schema.json](../schema-json/SaasTrialStatus.schema.json "open original schema") |

## SaasTrialStatus Type

`object` ([SaasTrialStatus](saastrialstatus.md))

# SaasTrialStatus Properties

| Property                                            | Type      | Required | Nullable       | Defined by                                                                                                               |
| :-------------------------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [daysRemaining](#daysremaining)                     | `integer` | Required | cannot be null | [SaasTrialStatus](saastrialstatus-properties-daysremaining.md "undefined#/properties/daysRemaining")                     |
| [invoiceMutationsBlocked](#invoicemutationsblocked) | `boolean` | Required | cannot be null | [SaasTrialStatus](saastrialstatus-properties-invoicemutationsblocked.md "undefined#/properties/invoiceMutationsBlocked") |
| [saasStatus](#saasstatus)                           | `string`  | Required | cannot be null | [SaasTrialStatus](saastrialstatus-properties-saasstatus.md "undefined#/properties/saasStatus")                           |
| [trialEndsAt](#trialendsat)                         | `string`  | Required | cannot be null | [SaasTrialStatus](saastrialstatus-properties-trialendsat.md "undefined#/properties/trialEndsAt")                         |

## daysRemaining



`daysRemaining`

* is required

* Type: `integer`

* cannot be null

* defined in: [SaasTrialStatus](saastrialstatus-properties-daysremaining.md "undefined#/properties/daysRemaining")

### daysRemaining Type

`integer`

## invoiceMutationsBlocked



`invoiceMutationsBlocked`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SaasTrialStatus](saastrialstatus-properties-invoicemutationsblocked.md "undefined#/properties/invoiceMutationsBlocked")

### invoiceMutationsBlocked Type

`boolean`

## saasStatus



`saasStatus`

* is required

* Type: `string`

* cannot be null

* defined in: [SaasTrialStatus](saastrialstatus-properties-saasstatus.md "undefined#/properties/saasStatus")

### saasStatus Type

`string`

## trialEndsAt



`trialEndsAt`

* is required

* Type: `string`

* cannot be null

* defined in: [SaasTrialStatus](saastrialstatus-properties-trialendsat.md "undefined#/properties/trialEndsAt")

### trialEndsAt Type

`string`

### trialEndsAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
