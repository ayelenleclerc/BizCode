# TenantModuleTrial Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TenantModuleTrialListEnvelope.schema.json\*](../schema-json/TenantModuleTrialListEnvelope.schema.json "open original schema") |

## items Type

`object` ([TenantModuleTrial](tenantmoduletrial.md))

# items Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [active](#active)               | `boolean` | Required | cannot be null | [TenantModuleTrial](tenantmoduletrial-properties-active.md "undefined#/properties/active")               |
| [createdAt](#createdat)         | `string`  | Required | cannot be null | [TenantModuleTrial](tenantmoduletrial-properties-createdat.md "undefined#/properties/createdAt")         |
| [daysRemaining](#daysremaining) | `integer` | Required | cannot be null | [TenantModuleTrial](tenantmoduletrial-properties-daysremaining.md "undefined#/properties/daysRemaining") |
| [expiresAt](#expiresat)         | `string`  | Required | cannot be null | [TenantModuleTrial](tenantmoduletrial-properties-expiresat.md "undefined#/properties/expiresAt")         |
| [id](#id)                       | `integer` | Required | cannot be null | [TenantModuleTrial](tenantmoduletrial-properties-id.md "undefined#/properties/id")                       |
| [moduleKey](#modulekey)         | `string`  | Required | cannot be null | [TenantModuleTrial](tenantmoduletrial-properties-modulekey.md "undefined#/properties/moduleKey")         |
| [tenantId](#tenantid)           | `integer` | Required | cannot be null | [TenantModuleTrial](tenantmoduletrial-properties-tenantid.md "undefined#/properties/tenantId")           |

## active



`active`

* is required

* Type: `boolean`

* cannot be null

* defined in: [TenantModuleTrial](tenantmoduletrial-properties-active.md "undefined#/properties/active")

### active Type

`boolean`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [TenantModuleTrial](tenantmoduletrial-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## daysRemaining



`daysRemaining`

* is required

* Type: `integer`

* cannot be null

* defined in: [TenantModuleTrial](tenantmoduletrial-properties-daysremaining.md "undefined#/properties/daysRemaining")

### daysRemaining Type

`integer`

### daysRemaining Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## expiresAt



`expiresAt`

* is required

* Type: `string`

* cannot be null

* defined in: [TenantModuleTrial](tenantmoduletrial-properties-expiresat.md "undefined#/properties/expiresAt")

### expiresAt Type

`string`

### expiresAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [TenantModuleTrial](tenantmoduletrial-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## moduleKey



`moduleKey`

* is required

* Type: `string`

* cannot be null

* defined in: [TenantModuleTrial](tenantmoduletrial-properties-modulekey.md "undefined#/properties/moduleKey")

### moduleKey Type

`string`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [TenantModuleTrial](tenantmoduletrial-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`
