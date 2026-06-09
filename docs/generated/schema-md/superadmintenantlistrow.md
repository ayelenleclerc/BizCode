# SuperadminTenantListRow Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SuperadminTenantListRow.schema.json](../schema-json/SuperadminTenantListRow.schema.json "open original schema") |

## SuperadminTenantListRow Type

`object` ([SuperadminTenantListRow](superadmintenantlistrow.md))

# SuperadminTenantListRow Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                                                         |
| :---------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [active](#active)             | `boolean` | Required | cannot be null | [SuperadminTenantListRow](superadmintenantlistrow-properties-active.md "undefined#/properties/active")             |
| [createdAt](#createdat)       | `string`  | Required | cannot be null | [SuperadminTenantListRow](superadmintenantlistrow-properties-createdat.md "undefined#/properties/createdAt")       |
| [facturaCount](#facturacount) | `integer` | Required | cannot be null | [SuperadminTenantListRow](superadmintenantlistrow-properties-facturacount.md "undefined#/properties/facturaCount") |
| [id](#id)                     | `integer` | Required | cannot be null | [SuperadminTenantListRow](superadmintenantlistrow-properties-id.md "undefined#/properties/id")                     |
| [name](#name)                 | `string`  | Required | cannot be null | [SuperadminTenantListRow](superadmintenantlistrow-properties-name.md "undefined#/properties/name")                 |
| [plan](#plan)                 | `string`  | Required | cannot be null | [SuperadminTenantListRow](superadmintenantlistrow-properties-plan.md "undefined#/properties/plan")                 |
| [slug](#slug)                 | `string`  | Required | cannot be null | [SuperadminTenantListRow](superadmintenantlistrow-properties-slug.md "undefined#/properties/slug")                 |
| [userCount](#usercount)       | `integer` | Required | cannot be null | [SuperadminTenantListRow](superadmintenantlistrow-properties-usercount.md "undefined#/properties/userCount")       |

## active



`active`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SuperadminTenantListRow](superadmintenantlistrow-properties-active.md "undefined#/properties/active")

### active Type

`boolean`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminTenantListRow](superadmintenantlistrow-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## facturaCount



`facturaCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [SuperadminTenantListRow](superadmintenantlistrow-properties-facturacount.md "undefined#/properties/facturaCount")

### facturaCount Type

`integer`

### facturaCount Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [SuperadminTenantListRow](superadmintenantlistrow-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## name



`name`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminTenantListRow](superadmintenantlistrow-properties-name.md "undefined#/properties/name")

### name Type

`string`

## plan



`plan`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminTenantListRow](superadmintenantlistrow-properties-plan.md "undefined#/properties/plan")

### plan Type

`string`

## slug



`slug`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminTenantListRow](superadmintenantlistrow-properties-slug.md "undefined#/properties/slug")

### slug Type

`string`

## userCount



`userCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [SuperadminTenantListRow](superadmintenantlistrow-properties-usercount.md "undefined#/properties/userCount")

### userCount Type

`integer`

### userCount Constraints

**minimum**: the value of this number must greater than or equal to: `0`
