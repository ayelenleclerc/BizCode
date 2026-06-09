# RemitoInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RemitoInput.schema.json](../schema-json/RemitoInput.schema.json "open original schema") |

## RemitoInput Type

`object` ([RemitoInput](remitoinput.md))

# RemitoInput Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                     |
| :-------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid)           | `integer` | Optional | cannot be null | [RemitoInput](remitoinput-properties-clienteid.md "undefined#/properties/clienteId")           |
| [facturaId](#facturaid)           | `integer` | Optional | cannot be null | [RemitoInput](remitoinput-properties-facturaid.md "undefined#/properties/facturaId")           |
| [fecha](#fecha)                   | `string`  | Optional | cannot be null | [RemitoInput](remitoinput-properties-fecha.md "undefined#/properties/fecha")                   |
| [items](#items)                   | `array`   | Required | cannot be null | [RemitoInput](remitoinput-properties-items.md "undefined#/properties/items")                   |
| [observaciones](#observaciones)   | `string`  | Optional | cannot be null | [RemitoInput](remitoinput-properties-observaciones.md "undefined#/properties/observaciones")   |
| [ordenEntregaId](#ordenentregaid) | `integer` | Optional | cannot be null | [RemitoInput](remitoinput-properties-ordenentregaid.md "undefined#/properties/ordenEntregaId") |
| [pedidoId](#pedidoid)             | `integer` | Optional | cannot be null | [RemitoInput](remitoinput-properties-pedidoid.md "undefined#/properties/pedidoId")             |
| [proveedorId](#proveedorid)       | `integer` | Optional | cannot be null | [RemitoInput](remitoinput-properties-proveedorid.md "undefined#/properties/proveedorId")       |
| [tipo](#tipo)                     | `string`  | Required | cannot be null | [RemitoInput](remitoinput-properties-tipo.md "undefined#/properties/tipo")                     |

## clienteId



`clienteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [RemitoInput](remitoinput-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## facturaId



`facturaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [RemitoInput](remitoinput-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

## fecha



`fecha`

* is optional

* Type: `string`

* cannot be null

* defined in: [RemitoInput](remitoinput-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## items



`items`

* is required

* Type: `object[]` ([RemitoItemInput](remitoiteminput.md))

* cannot be null

* defined in: [RemitoInput](remitoinput-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([RemitoItemInput](remitoiteminput.md))

### items Constraints

**minimum number of items**: the minimum number of items for this array is: `1`

## observaciones



`observaciones`

* is optional

* Type: `string`

* cannot be null

* defined in: [RemitoInput](remitoinput-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

## ordenEntregaId



`ordenEntregaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [RemitoInput](remitoinput-properties-ordenentregaid.md "undefined#/properties/ordenEntregaId")

### ordenEntregaId Type

`integer`

## pedidoId



`pedidoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [RemitoInput](remitoinput-properties-pedidoid.md "undefined#/properties/pedidoId")

### pedidoId Type

`integer`

## proveedorId



`proveedorId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [RemitoInput](remitoinput-properties-proveedorid.md "undefined#/properties/proveedorId")

### proveedorId Type

`integer`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [RemitoInput](remitoinput-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value              | Explanation |
| :----------------- | :---------- |
| `"remito_x"`       |             |
| `"remito_ingreso"` |             |
