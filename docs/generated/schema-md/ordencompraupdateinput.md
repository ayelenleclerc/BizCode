# OrdenCompraUpdateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenCompraUpdateInput.schema.json](../schema-json/OrdenCompraUpdateInput.schema.json "open original schema") |

## OrdenCompraUpdateInput Type

`object` ([OrdenCompraUpdateInput](ordencompraupdateinput.md))

# OrdenCompraUpdateInput Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                         |
| :------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [fechaEstimada](#fechaestimada) | `string`  | Optional | cannot be null | [OrdenCompraUpdateInput](ordencompraupdateinput-properties-fechaestimada.md "undefined#/properties/fechaEstimada") |
| [items](#items)                 | `array`   | Optional | cannot be null | [OrdenCompraUpdateInput](ordencompraupdateinput-properties-items.md "undefined#/properties/items")                 |
| [nota](#nota)                   | `string`  | Optional | cannot be null | [OrdenCompraUpdateInput](ordencompraupdateinput-properties-nota.md "undefined#/properties/nota")                   |
| [proveedorId](#proveedorid)     | `integer` | Optional | cannot be null | [OrdenCompraUpdateInput](ordencompraupdateinput-properties-proveedorid.md "undefined#/properties/proveedorId")     |

## fechaEstimada



`fechaEstimada`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenCompraUpdateInput](ordencompraupdateinput-properties-fechaestimada.md "undefined#/properties/fechaEstimada")

### fechaEstimada Type

`string`

### fechaEstimada Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## items



`items`

* is optional

* Type: `object[]` ([OrdenCompraItemInput](ordencompraiteminput.md))

* cannot be null

* defined in: [OrdenCompraUpdateInput](ordencompraupdateinput-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([OrdenCompraItemInput](ordencompraiteminput.md))

### items Constraints

**minimum number of items**: the minimum number of items for this array is: `1`

## nota



`nota`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenCompraUpdateInput](ordencompraupdateinput-properties-nota.md "undefined#/properties/nota")

### nota Type

`string`

### nota Constraints

**maximum length**: the maximum number of characters for this string is: `200`

## proveedorId



`proveedorId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenCompraUpdateInput](ordencompraupdateinput-properties-proveedorid.md "undefined#/properties/proveedorId")

### proveedorId Type

`integer`
