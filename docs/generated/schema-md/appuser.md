# AppUser Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Forbidden             | none                | [AppUserListEnvelope.schema.json\*](../schema-json/AppUserListEnvelope.schema.json "open original schema") |

## items Type

`object` ([AppUser](appuser.md))

# items Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                   |
| :-------------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [active](#active)                       | `boolean` | Optional | cannot be null | [AppUser](appuser-properties-active.md "undefined#/properties/active")                       |
| [createdAt](#createdat)                 | `string`  | Optional | cannot be null | [AppUser](appuser-properties-createdat.md "undefined#/properties/createdAt")                 |
| [id](#id)                               | `integer` | Optional | cannot be null | [AppUser](appuser-properties-id.md "undefined#/properties/id")                               |
| [role](#role)                           | `string`  | Optional | cannot be null | [AppUser](appuser-properties-role.md "undefined#/properties/role")                           |
| [scopeBranchIds](#scopebranchids)       | `array`   | Optional | cannot be null | [AppUser](appuser-properties-scopebranchids.md "undefined#/properties/scopeBranchIds")       |
| [scopeChannels](#scopechannels)         | `array`   | Optional | cannot be null | [AppUser](appuser-properties-scopechannels.md "undefined#/properties/scopeChannels")         |
| [scopeRouteIds](#scoperouteids)         | `array`   | Optional | cannot be null | [AppUser](appuser-properties-scoperouteids.md "undefined#/properties/scopeRouteIds")         |
| [scopeWarehouseIds](#scopewarehouseids) | `array`   | Optional | cannot be null | [AppUser](appuser-properties-scopewarehouseids.md "undefined#/properties/scopeWarehouseIds") |
| [updatedAt](#updatedat)                 | `string`  | Optional | cannot be null | [AppUser](appuser-properties-updatedat.md "undefined#/properties/updatedAt")                 |
| [username](#username)                   | `string`  | Optional | cannot be null | [AppUser](appuser-properties-username.md "undefined#/properties/username")                   |

## active



`active`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [AppUser](appuser-properties-active.md "undefined#/properties/active")

### active Type

`boolean`

## createdAt



`createdAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [AppUser](appuser-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [AppUser](appuser-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## role



`role`

* is optional

* Type: `string`

* cannot be null

* defined in: [AppUser](appuser-properties-role.md "undefined#/properties/role")

### role Type

`string`

### role Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                 | Explanation |
| :-------------------- | :---------- |
| `"super_admin"`       |             |
| `"owner"`             |             |
| `"manager"`           |             |
| `"seller"`            |             |
| `"backoffice"`        |             |
| `"warehouse_op"`      |             |
| `"warehouse_lead"`    |             |
| `"logistics_planner"` |             |
| `"driver"`            |             |
| `"billing"`           |             |
| `"cashier"`           |             |
| `"collections"`       |             |
| `"finance"`           |             |
| `"auditor"`           |             |

## scopeBranchIds



`scopeBranchIds`

* is optional

* Type: `integer[]`

* cannot be null

* defined in: [AppUser](appuser-properties-scopebranchids.md "undefined#/properties/scopeBranchIds")

### scopeBranchIds Type

`integer[]`

## scopeChannels



`scopeChannels`

* is optional

* Type: `string[]`

* cannot be null

* defined in: [AppUser](appuser-properties-scopechannels.md "undefined#/properties/scopeChannels")

### scopeChannels Type

`string[]`

## scopeRouteIds



`scopeRouteIds`

* is optional

* Type: `integer[]`

* cannot be null

* defined in: [AppUser](appuser-properties-scoperouteids.md "undefined#/properties/scopeRouteIds")

### scopeRouteIds Type

`integer[]`

## scopeWarehouseIds



`scopeWarehouseIds`

* is optional

* Type: `integer[]`

* cannot be null

* defined in: [AppUser](appuser-properties-scopewarehouseids.md "undefined#/properties/scopeWarehouseIds")

### scopeWarehouseIds Type

`integer[]`

## updatedAt



`updatedAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [AppUser](appuser-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## username



`username`

* is optional

* Type: `string`

* cannot be null

* defined in: [AppUser](appuser-properties-username.md "undefined#/properties/username")

### username Type

`string`
