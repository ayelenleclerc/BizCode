# RemitoUpdateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RemitoUpdateInput.schema.json](../schema-json/RemitoUpdateInput.schema.json "open original schema") |

## RemitoUpdateInput Type

`object` ([RemitoUpdateInput](remitoupdateinput.md))

# RemitoUpdateInput Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid)         | `integer` | Optional | cannot be null | [RemitoUpdateInput](remitoupdateinput-properties-clienteid.md "undefined#/properties/clienteId")         |
| [items](#items)                 | `array`   | Optional | cannot be null | [RemitoUpdateInput](remitoupdateinput-properties-items.md "undefined#/properties/items")                 |
| [observaciones](#observaciones) | `string`  | Optional | cannot be null | [RemitoUpdateInput](remitoupdateinput-properties-observaciones.md "undefined#/properties/observaciones") |
| [proveedorId](#proveedorid)     | `integer` | Optional | cannot be null | [RemitoUpdateInput](remitoupdateinput-properties-proveedorid.md "undefined#/properties/proveedorId")     |

## clienteId



`clienteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [RemitoUpdateInput](remitoupdateinput-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## items



`items`

* is optional

* Type: `object[]` ([RemitoItemInput](remitoiteminput.md))

* cannot be null

* defined in: [RemitoUpdateInput](remitoupdateinput-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([RemitoItemInput](remitoiteminput.md))

### items Constraints

**minimum number of items**: the minimum number of items for this array is: `1`

## observaciones



`observaciones`

* is optional

* Type: `string`

* cannot be null

* defined in: [RemitoUpdateInput](remitoupdateinput-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

## proveedorId



`proveedorId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [RemitoUpdateInput](remitoupdateinput-properties-proveedorid.md "undefined#/properties/proveedorId")

### proveedorId Type

`integer`
