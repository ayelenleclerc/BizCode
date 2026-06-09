# OrdenCompraCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenCompraCreateInput.schema.json](../schema-json/OrdenCompraCreateInput.schema.json "open original schema") |

## OrdenCompraCreateInput Type

`object` ([OrdenCompraCreateInput](ordencompracreateinput.md))

# OrdenCompraCreateInput Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                         |
| :------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [fechaEstimada](#fechaestimada) | `string`  | Optional | cannot be null | [OrdenCompraCreateInput](ordencompracreateinput-properties-fechaestimada.md "undefined#/properties/fechaEstimada") |
| [items](#items)                 | `array`   | Required | cannot be null | [OrdenCompraCreateInput](ordencompracreateinput-properties-items.md "undefined#/properties/items")                 |
| [nota](#nota)                   | `string`  | Optional | cannot be null | [OrdenCompraCreateInput](ordencompracreateinput-properties-nota.md "undefined#/properties/nota")                   |
| [proveedorId](#proveedorid)     | `integer` | Required | cannot be null | [OrdenCompraCreateInput](ordencompracreateinput-properties-proveedorid.md "undefined#/properties/proveedorId")     |

## fechaEstimada



`fechaEstimada`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenCompraCreateInput](ordencompracreateinput-properties-fechaestimada.md "undefined#/properties/fechaEstimada")

### fechaEstimada Type

`string`

### fechaEstimada Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## items



`items`

* is required

* Type: `object[]` ([OrdenCompraItemInput](ordencompraiteminput.md))

* cannot be null

* defined in: [OrdenCompraCreateInput](ordencompracreateinput-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([OrdenCompraItemInput](ordencompraiteminput.md))

### items Constraints

**minimum number of items**: the minimum number of items for this array is: `1`

## nota



`nota`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenCompraCreateInput](ordencompracreateinput-properties-nota.md "undefined#/properties/nota")

### nota Type

`string`

### nota Constraints

**maximum length**: the maximum number of characters for this string is: `200`

## proveedorId



`proveedorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenCompraCreateInput](ordencompracreateinput-properties-proveedorid.md "undefined#/properties/proveedorId")

### proveedorId Type

`integer`
