# AppUserInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [AppUserInput.schema.json](../schema-json/AppUserInput.schema.json "open original schema") |

## AppUserInput Type

`object` ([AppUserInput](appuserinput.md))

# AppUserInput Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                             |
| :-------------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [active](#active)                       | `boolean` | Optional | cannot be null | [AppUserInput](appuserinput-properties-active.md "undefined#/properties/active")                       |
| [password](#password)                   | `string`  | Required | cannot be null | [AppUserInput](appuserinput-properties-password.md "undefined#/properties/password")                   |
| [role](#role)                           | `string`  | Required | cannot be null | [AppUserInput](appuserinput-properties-role.md "undefined#/properties/role")                           |
| [scopeBranchIds](#scopebranchids)       | `array`   | Optional | cannot be null | [AppUserInput](appuserinput-properties-scopebranchids.md "undefined#/properties/scopeBranchIds")       |
| [scopeChannels](#scopechannels)         | `array`   | Optional | cannot be null | [AppUserInput](appuserinput-properties-scopechannels.md "undefined#/properties/scopeChannels")         |
| [scopeRouteIds](#scoperouteids)         | `array`   | Optional | cannot be null | [AppUserInput](appuserinput-properties-scoperouteids.md "undefined#/properties/scopeRouteIds")         |
| [scopeWarehouseIds](#scopewarehouseids) | `array`   | Optional | cannot be null | [AppUserInput](appuserinput-properties-scopewarehouseids.md "undefined#/properties/scopeWarehouseIds") |
| [username](#username)                   | `string`  | Required | cannot be null | [AppUserInput](appuserinput-properties-username.md "undefined#/properties/username")                   |

## active



`active`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [AppUserInput](appuserinput-properties-active.md "undefined#/properties/active")

### active Type

`boolean`

### active Default Value

The default value is:

```json
true
```

## password



`password`

* is required

* Type: `string`

* cannot be null

* defined in: [AppUserInput](appuserinput-properties-password.md "undefined#/properties/password")

### password Type

`string`

### password Constraints

**minimum length**: the minimum number of characters for this string is: `8`

## role



`role`

* is required

* Type: `string`

* cannot be null

* defined in: [AppUserInput](appuserinput-properties-role.md "undefined#/properties/role")

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

* defined in: [AppUserInput](appuserinput-properties-scopebranchids.md "undefined#/properties/scopeBranchIds")

### scopeBranchIds Type

`integer[]`

## scopeChannels



`scopeChannels`

* is optional

* Type: `string[]`

* cannot be null

* defined in: [AppUserInput](appuserinput-properties-scopechannels.md "undefined#/properties/scopeChannels")

### scopeChannels Type

`string[]`

## scopeRouteIds



`scopeRouteIds`

* is optional

* Type: `integer[]`

* cannot be null

* defined in: [AppUserInput](appuserinput-properties-scoperouteids.md "undefined#/properties/scopeRouteIds")

### scopeRouteIds Type

`integer[]`

## scopeWarehouseIds



`scopeWarehouseIds`

* is optional

* Type: `integer[]`

* cannot be null

* defined in: [AppUserInput](appuserinput-properties-scopewarehouseids.md "undefined#/properties/scopeWarehouseIds")

### scopeWarehouseIds Type

`integer[]`

## username



`username`

* is required

* Type: `string`

* cannot be null

* defined in: [AppUserInput](appuserinput-properties-username.md "undefined#/properties/username")

### username Type

`string`

### username Constraints

**minimum length**: the minimum number of characters for this string is: `3`
