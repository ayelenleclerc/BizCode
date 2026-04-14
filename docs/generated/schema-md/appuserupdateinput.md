# AppUserUpdateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [AppUserUpdateInput.schema.json](../schema-json/AppUserUpdateInput.schema.json "open original schema") |

## AppUserUpdateInput Type

`object` ([AppUserUpdateInput](appuserupdateinput.md))

# AppUserUpdateInput Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                                         |
| :-------------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [active](#active)                       | `boolean` | Optional | cannot be null | [AppUserUpdateInput](appuserupdateinput-properties-active.md "undefined#/properties/active")                       |
| [role](#role)                           | `string`  | Optional | cannot be null | [AppUserUpdateInput](appuserupdateinput-properties-role.md "undefined#/properties/role")                           |
| [scopeBranchIds](#scopebranchids)       | `array`   | Optional | cannot be null | [AppUserUpdateInput](appuserupdateinput-properties-scopebranchids.md "undefined#/properties/scopeBranchIds")       |
| [scopeChannels](#scopechannels)         | `array`   | Optional | cannot be null | [AppUserUpdateInput](appuserupdateinput-properties-scopechannels.md "undefined#/properties/scopeChannels")         |
| [scopeRouteIds](#scoperouteids)         | `array`   | Optional | cannot be null | [AppUserUpdateInput](appuserupdateinput-properties-scoperouteids.md "undefined#/properties/scopeRouteIds")         |
| [scopeWarehouseIds](#scopewarehouseids) | `array`   | Optional | cannot be null | [AppUserUpdateInput](appuserupdateinput-properties-scopewarehouseids.md "undefined#/properties/scopeWarehouseIds") |

## active



`active`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [AppUserUpdateInput](appuserupdateinput-properties-active.md "undefined#/properties/active")

### active Type

`boolean`

## role



`role`

* is optional

* Type: `string`

* cannot be null

* defined in: [AppUserUpdateInput](appuserupdateinput-properties-role.md "undefined#/properties/role")

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

* defined in: [AppUserUpdateInput](appuserupdateinput-properties-scopebranchids.md "undefined#/properties/scopeBranchIds")

### scopeBranchIds Type

`integer[]`

## scopeChannels



`scopeChannels`

* is optional

* Type: `string[]`

* cannot be null

* defined in: [AppUserUpdateInput](appuserupdateinput-properties-scopechannels.md "undefined#/properties/scopeChannels")

### scopeChannels Type

`string[]`

## scopeRouteIds



`scopeRouteIds`

* is optional

* Type: `integer[]`

* cannot be null

* defined in: [AppUserUpdateInput](appuserupdateinput-properties-scoperouteids.md "undefined#/properties/scopeRouteIds")

### scopeRouteIds Type

`integer[]`

## scopeWarehouseIds



`scopeWarehouseIds`

* is optional

* Type: `integer[]`

* cannot be null

* defined in: [AppUserUpdateInput](appuserupdateinput-properties-scopewarehouseids.md "undefined#/properties/scopeWarehouseIds")

### scopeWarehouseIds Type

`integer[]`
