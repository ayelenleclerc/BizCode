# TenantConfigHistoryEntry Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TenantConfigHistoryEntry.schema.json](../schema-json/TenantConfigHistoryEntry.schema.json "open original schema") |

## TenantConfigHistoryEntry Type

`object` ([TenantConfigHistoryEntry](tenantconfighistoryentry.md))

# TenantConfigHistoryEntry Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                                         |
| :-------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [after](#after)             | `object`  | Required | cannot be null | [TenantConfigHistoryEntry](tenantconfighistoryentry-properties-after.md "undefined#/properties/after")             |
| [before](#before)           | `object`  | Required | cannot be null | [TenantConfigHistoryEntry](tenantconfighistoryentry-properties-before.md "undefined#/properties/before")           |
| [changedById](#changedbyid) | `integer` | Required | cannot be null | [TenantConfigHistoryEntry](tenantconfighistoryentry-properties-changedbyid.md "undefined#/properties/changedById") |
| [createdAt](#createdat)     | `string`  | Required | cannot be null | [TenantConfigHistoryEntry](tenantconfighistoryentry-properties-createdat.md "undefined#/properties/createdAt")     |
| [id](#id)                   | `integer` | Required | cannot be null | [TenantConfigHistoryEntry](tenantconfighistoryentry-properties-id.md "undefined#/properties/id")                   |
| [reason](#reason)           | `string`  | Optional | cannot be null | [TenantConfigHistoryEntry](tenantconfighistoryentry-properties-reason.md "undefined#/properties/reason")           |

## after



`after`

* is required

* Type: `object` ([Details](tenantconfighistoryentry-properties-after.md))

* cannot be null

* defined in: [TenantConfigHistoryEntry](tenantconfighistoryentry-properties-after.md "undefined#/properties/after")

### after Type

`object` ([Details](tenantconfighistoryentry-properties-after.md))

## before



`before`

* is required

* Type: `object` ([Details](tenantconfighistoryentry-properties-before.md))

* cannot be null

* defined in: [TenantConfigHistoryEntry](tenantconfighistoryentry-properties-before.md "undefined#/properties/before")

### before Type

`object` ([Details](tenantconfighistoryentry-properties-before.md))

## changedById



`changedById`

* is required

* Type: `integer`

* cannot be null

* defined in: [TenantConfigHistoryEntry](tenantconfighistoryentry-properties-changedbyid.md "undefined#/properties/changedById")

### changedById Type

`integer`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [TenantConfigHistoryEntry](tenantconfighistoryentry-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [TenantConfigHistoryEntry](tenantconfighistoryentry-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## reason



`reason`

* is optional

* Type: `string`

* cannot be null

* defined in: [TenantConfigHistoryEntry](tenantconfighistoryentry-properties-reason.md "undefined#/properties/reason")

### reason Type

`string`
