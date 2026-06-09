# SuperadminTenantDetail Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SuperadminTenantDetailEnvelope.schema.json\*](../schema-json/SuperadminTenantDetailEnvelope.schema.json "open original schema") |

## data Type

`object` ([SuperadminTenantDetail](superadmintenantdetail.md))

# data Properties

| Property                            | Type      | Required | Nullable       | Defined by                                                                                                             |
| :---------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [active](#active)                   | `boolean` | Required | cannot be null | [SuperadminTenantDetail](superadmintenantdetail-properties-active.md "undefined#/properties/active")                   |
| [configUpdatedAt](#configupdatedat) | `string`  | Required | cannot be null | [SuperadminTenantDetail](superadmintenantdetail-properties-configupdatedat.md "undefined#/properties/configUpdatedAt") |
| [createdAt](#createdat)             | `string`  | Required | cannot be null | [SuperadminTenantDetail](superadmintenantdetail-properties-createdat.md "undefined#/properties/createdAt")             |
| [id](#id)                           | `integer` | Required | cannot be null | [SuperadminTenantDetail](superadmintenantdetail-properties-id.md "undefined#/properties/id")                           |
| [lastActivityAt](#lastactivityat)   | `string`  | Required | cannot be null | [SuperadminTenantDetail](superadmintenantdetail-properties-lastactivityat.md "undefined#/properties/lastActivityAt")   |
| [modulesCount](#modulescount)       | `integer` | Required | cannot be null | [SuperadminTenantDetail](superadmintenantdetail-properties-modulescount.md "undefined#/properties/modulesCount")       |
| [name](#name)                       | `string`  | Required | cannot be null | [SuperadminTenantDetail](superadmintenantdetail-properties-name.md "undefined#/properties/name")                       |
| [plan](#plan)                       | `string`  | Required | cannot be null | [SuperadminTenantDetail](superadmintenantdetail-properties-plan.md "undefined#/properties/plan")                       |
| [slug](#slug)                       | `string`  | Required | cannot be null | [SuperadminTenantDetail](superadmintenantdetail-properties-slug.md "undefined#/properties/slug")                       |
| [stats](#stats)                     | `object`  | Required | cannot be null | [SuperadminTenantDetail](superadmintenantstats.md "undefined#/properties/stats")                                       |
| [updatedAt](#updatedat)             | `string`  | Required | cannot be null | [SuperadminTenantDetail](superadmintenantdetail-properties-updatedat.md "undefined#/properties/updatedAt")             |

## active



`active`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SuperadminTenantDetail](superadmintenantdetail-properties-active.md "undefined#/properties/active")

### active Type

`boolean`

## configUpdatedAt



`configUpdatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminTenantDetail](superadmintenantdetail-properties-configupdatedat.md "undefined#/properties/configUpdatedAt")

### configUpdatedAt Type

`string`

### configUpdatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminTenantDetail](superadmintenantdetail-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [SuperadminTenantDetail](superadmintenantdetail-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## lastActivityAt



`lastActivityAt`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminTenantDetail](superadmintenantdetail-properties-lastactivityat.md "undefined#/properties/lastActivityAt")

### lastActivityAt Type

`string`

### lastActivityAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## modulesCount



`modulesCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [SuperadminTenantDetail](superadmintenantdetail-properties-modulescount.md "undefined#/properties/modulesCount")

### modulesCount Type

`integer`

### modulesCount Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## name



`name`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminTenantDetail](superadmintenantdetail-properties-name.md "undefined#/properties/name")

### name Type

`string`

## plan



`plan`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminTenantDetail](superadmintenantdetail-properties-plan.md "undefined#/properties/plan")

### plan Type

`string`

## slug



`slug`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminTenantDetail](superadmintenantdetail-properties-slug.md "undefined#/properties/slug")

### slug Type

`string`

## stats



`stats`

* is required

* Type: `object` ([SuperadminTenantStats](superadmintenantstats.md))

* cannot be null

* defined in: [SuperadminTenantDetail](superadmintenantstats.md "undefined#/properties/stats")

### stats Type

`object` ([SuperadminTenantStats](superadmintenantstats.md))

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminTenantDetail](superadmintenantdetail-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
