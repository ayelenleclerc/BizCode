# OrdenCompra Schema

```txt
undefined#/properties/data/properties/ordenCompra
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReposicionOcCreatedEnvelope.schema.json\*](../schema-json/ReposicionOcCreatedEnvelope.schema.json "open original schema") |

## ordenCompra Type

`object` ([OrdenCompra](ordencompra.md))

# ordenCompra Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                   |
| :------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [estado](#estado)               | `string`  | Required | cannot be null | [OrdenCompra](ordencompra-properties-estado.md "undefined#/properties/estado")               |
| [fechaEstimada](#fechaestimada) | `string`  | Optional | cannot be null | [OrdenCompra](ordencompra-properties-fechaestimada.md "undefined#/properties/fechaEstimada") |
| [id](#id)                       | `integer` | Required | cannot be null | [OrdenCompra](ordencompra-properties-id.md "undefined#/properties/id")                       |
| [items](#items)                 | `array`   | Optional | cannot be null | [OrdenCompra](ordencompra-properties-items.md "undefined#/properties/items")                 |
| [nota](#nota)                   | `string`  | Optional | cannot be null | [OrdenCompra](ordencompra-properties-nota.md "undefined#/properties/nota")                   |
| [proveedor](#proveedor)         | `object`  | Optional | cannot be null | [OrdenCompra](ordencompra-properties-proveedor.md "undefined#/properties/proveedor")         |
| [proveedorId](#proveedorid)     | `integer` | Required | cannot be null | [OrdenCompra](ordencompra-properties-proveedorid.md "undefined#/properties/proveedorId")     |
| [tenantId](#tenantid)           | `integer` | Required | cannot be null | [OrdenCompra](ordencompra-properties-tenantid.md "undefined#/properties/tenantId")           |
| [total](#total)                 | `string`  | Required | cannot be null | [OrdenCompra](ordencompra-properties-total.md "undefined#/properties/total")                 |

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [OrdenCompra](ordencompra-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value         | Explanation |
| :------------ | :---------- |
| `"draft"`     |             |
| `"sent"`      |             |
| `"received"`  |             |
| `"cancelled"` |             |

## fechaEstimada



`fechaEstimada`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenCompra](ordencompra-properties-fechaestimada.md "undefined#/properties/fechaEstimada")

### fechaEstimada Type

`string`

### fechaEstimada Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenCompra](ordencompra-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## items



`items`

* is optional

* Type: `object[]` ([OrdenCompraItemLine](ordencompraitemline.md))

* cannot be null

* defined in: [OrdenCompra](ordencompra-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([OrdenCompraItemLine](ordencompraitemline.md))

## nota



`nota`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenCompra](ordencompra-properties-nota.md "undefined#/properties/nota")

### nota Type

`string`

## proveedor



`proveedor`

* is optional

* Type: `object` ([Details](ordencompra-properties-proveedor.md))

* cannot be null

* defined in: [OrdenCompra](ordencompra-properties-proveedor.md "undefined#/properties/proveedor")

### proveedor Type

`object` ([Details](ordencompra-properties-proveedor.md))

## proveedorId



`proveedorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenCompra](ordencompra-properties-proveedorid.md "undefined#/properties/proveedorId")

### proveedorId Type

`integer`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenCompra](ordencompra-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## total



`total`

* is required

* Type: `string`

* cannot be null

* defined in: [OrdenCompra](ordencompra-properties-total.md "undefined#/properties/total")

### total Type

`string`
