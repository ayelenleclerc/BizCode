# SaasRegisterResult Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SaasRegisterResult.schema.json](../schema-json/SaasRegisterResult.schema.json "open original schema") |

## SaasRegisterResult Type

`object` ([SaasRegisterResult](saasregisterresult.md))

# SaasRegisterResult Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                 |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [emailSent](#emailsent)         | `boolean` | Required | cannot be null | [SaasRegisterResult](saasregisterresult-properties-emailsent.md "undefined#/properties/emailSent")         |
| [ownerUsername](#ownerusername) | `string`  | Required | cannot be null | [SaasRegisterResult](saasregisterresult-properties-ownerusername.md "undefined#/properties/ownerUsername") |
| [saasStatus](#saasstatus)       | `string`  | Required | cannot be null | [SaasRegisterResult](saasregisterresult-properties-saasstatus.md "undefined#/properties/saasStatus")       |
| [tenantId](#tenantid)           | `integer` | Required | cannot be null | [SaasRegisterResult](saasregisterresult-properties-tenantid.md "undefined#/properties/tenantId")           |
| [tenantSlug](#tenantslug)       | `string`  | Required | cannot be null | [SaasRegisterResult](saasregisterresult-properties-tenantslug.md "undefined#/properties/tenantSlug")       |
| [trialEndsAt](#trialendsat)     | `string`  | Required | cannot be null | [SaasRegisterResult](saasregisterresult-properties-trialendsat.md "undefined#/properties/trialEndsAt")     |

## emailSent



`emailSent`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SaasRegisterResult](saasregisterresult-properties-emailsent.md "undefined#/properties/emailSent")

### emailSent Type

`boolean`

## ownerUsername



`ownerUsername`

* is required

* Type: `string`

* cannot be null

* defined in: [SaasRegisterResult](saasregisterresult-properties-ownerusername.md "undefined#/properties/ownerUsername")

### ownerUsername Type

`string`

## saasStatus



`saasStatus`

* is required

* Type: `string`

* cannot be null

* defined in: [SaasRegisterResult](saasregisterresult-properties-saasstatus.md "undefined#/properties/saasStatus")

### saasStatus Type

`string`

### saasStatus Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value               | Explanation |
| :------------------ | :---------- |
| `"trial"`           |             |
| `"active"`          |             |
| `"suspended_trial"` |             |

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [SaasRegisterResult](saasregisterresult-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## tenantSlug



`tenantSlug`

* is required

* Type: `string`

* cannot be null

* defined in: [SaasRegisterResult](saasregisterresult-properties-tenantslug.md "undefined#/properties/tenantSlug")

### tenantSlug Type

`string`

## trialEndsAt



`trialEndsAt`

* is required

* Type: `string`

* cannot be null

* defined in: [SaasRegisterResult](saasregisterresult-properties-trialendsat.md "undefined#/properties/trialEndsAt")

### trialEndsAt Type

`string`

### trialEndsAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
