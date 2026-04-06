# AuthScope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [AuthScope.schema.json](../schema-json/AuthScope.schema.json "open original schema") |

## AuthScope Type

`object` ([AuthScope](authscope.md))

# AuthScope Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                             |
| :---------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------- |
| [branchIds](#branchids)       | `array`   | Required | cannot be null | [AuthScope](authscope-properties-branchids.md "undefined#/properties/branchIds")       |
| [channels](#channels)         | `array`   | Required | cannot be null | [AuthScope](authscope-properties-channels.md "undefined#/properties/channels")         |
| [routeIds](#routeids)         | `array`   | Required | cannot be null | [AuthScope](authscope-properties-routeids.md "undefined#/properties/routeIds")         |
| [tenantId](#tenantid)         | `integer` | Required | cannot be null | [AuthScope](authscope-properties-tenantid.md "undefined#/properties/tenantId")         |
| [warehouseIds](#warehouseids) | `array`   | Required | cannot be null | [AuthScope](authscope-properties-warehouseids.md "undefined#/properties/warehouseIds") |

## branchIds



`branchIds`

* is required

* Type: `integer[]`

* cannot be null

* defined in: [AuthScope](authscope-properties-branchids.md "undefined#/properties/branchIds")

### branchIds Type

`integer[]`

## channels



`channels`

* is required

* Type: `string[]`

* cannot be null

* defined in: [AuthScope](authscope-properties-channels.md "undefined#/properties/channels")

### channels Type

`string[]`

## routeIds



`routeIds`

* is required

* Type: `integer[]`

* cannot be null

* defined in: [AuthScope](authscope-properties-routeids.md "undefined#/properties/routeIds")

### routeIds Type

`integer[]`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [AuthScope](authscope-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## warehouseIds



`warehouseIds`

* is required

* Type: `integer[]`

* cannot be null

* defined in: [AuthScope](authscope-properties-warehouseids.md "undefined#/properties/warehouseIds")

### warehouseIds Type

`integer[]`
