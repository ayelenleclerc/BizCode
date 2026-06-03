# ComprobanteCompraInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ComprobanteCompraInput.schema.json](../schema-json/ComprobanteCompraInput.schema.json "open original schema") |

## ComprobanteCompraInput Type

`object` ([ComprobanteCompraInput](comprobantecomprainput.md))

# ComprobanteCompraInput Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                         |
| :------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [cae](#cae)                     | `string`  | Optional | cannot be null | [ComprobanteCompraInput](comprobantecomprainput-properties-cae.md "undefined#/properties/cae")                     |
| [caeVto](#caevto)               | `string`  | Optional | cannot be null | [ComprobanteCompraInput](comprobantecomprainput-properties-caevto.md "undefined#/properties/caeVto")               |
| [fecha](#fecha)                 | `string`  | Required | cannot be null | [ComprobanteCompraInput](comprobantecomprainput-properties-fecha.md "undefined#/properties/fecha")                 |
| [iva1](#iva1)                   | `number`  | Required | cannot be null | [ComprobanteCompraInput](comprobantecomprainput-properties-iva1.md "undefined#/properties/iva1")                   |
| [iva2](#iva2)                   | `number`  | Required | cannot be null | [ComprobanteCompraInput](comprobantecomprainput-properties-iva2.md "undefined#/properties/iva2")                   |
| [neto1](#neto1)                 | `number`  | Required | cannot be null | [ComprobanteCompraInput](comprobantecomprainput-properties-neto1.md "undefined#/properties/neto1")                 |
| [neto2](#neto2)                 | `number`  | Required | cannot be null | [ComprobanteCompraInput](comprobantecomprainput-properties-neto2.md "undefined#/properties/neto2")                 |
| [neto3](#neto3)                 | `number`  | Required | cannot be null | [ComprobanteCompraInput](comprobantecomprainput-properties-neto3.md "undefined#/properties/neto3")                 |
| [numero](#numero)               | `integer` | Required | cannot be null | [ComprobanteCompraInput](comprobantecomprainput-properties-numero.md "undefined#/properties/numero")               |
| [ordenCompraId](#ordencompraid) | `integer` | Optional | cannot be null | [ComprobanteCompraInput](comprobantecomprainput-properties-ordencompraid.md "undefined#/properties/ordenCompraId") |
| [prefijo](#prefijo)             | `string`  | Required | cannot be null | [ComprobanteCompraInput](comprobantecomprainput-properties-prefijo.md "undefined#/properties/prefijo")             |
| [proveedorId](#proveedorid)     | `integer` | Required | cannot be null | [ComprobanteCompraInput](comprobantecomprainput-properties-proveedorid.md "undefined#/properties/proveedorId")     |
| [tipo](#tipo)                   | `string`  | Required | cannot be null | [ComprobanteCompraInput](comprobantecomprainput-properties-tipo.md "undefined#/properties/tipo")                   |
| [total](#total)                 | `number`  | Required | cannot be null | [ComprobanteCompraInput](comprobantecomprainput-properties-total.md "undefined#/properties/total")                 |

## cae



`cae`

* is optional

* Type: `string`

* cannot be null

* defined in: [ComprobanteCompraInput](comprobantecomprainput-properties-cae.md "undefined#/properties/cae")

### cae Type

`string`

### cae Constraints

**maximum length**: the maximum number of characters for this string is: `20`

## caeVto



`caeVto`

* is optional

* Type: `string`

* cannot be null

* defined in: [ComprobanteCompraInput](comprobantecomprainput-properties-caevto.md "undefined#/properties/caeVto")

### caeVto Type

`string`

### caeVto Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [ComprobanteCompraInput](comprobantecomprainput-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## iva1



`iva1`

* is required

* Type: `number`

* cannot be null

* defined in: [ComprobanteCompraInput](comprobantecomprainput-properties-iva1.md "undefined#/properties/iva1")

### iva1 Type

`number`

### iva1 Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## iva2



`iva2`

* is required

* Type: `number`

* cannot be null

* defined in: [ComprobanteCompraInput](comprobantecomprainput-properties-iva2.md "undefined#/properties/iva2")

### iva2 Type

`number`

### iva2 Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## neto1



`neto1`

* is required

* Type: `number`

* cannot be null

* defined in: [ComprobanteCompraInput](comprobantecomprainput-properties-neto1.md "undefined#/properties/neto1")

### neto1 Type

`number`

### neto1 Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## neto2



`neto2`

* is required

* Type: `number`

* cannot be null

* defined in: [ComprobanteCompraInput](comprobantecomprainput-properties-neto2.md "undefined#/properties/neto2")

### neto2 Type

`number`

### neto2 Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## neto3



`neto3`

* is required

* Type: `number`

* cannot be null

* defined in: [ComprobanteCompraInput](comprobantecomprainput-properties-neto3.md "undefined#/properties/neto3")

### neto3 Type

`number`

### neto3 Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## numero



`numero`

* is required

* Type: `integer`

* cannot be null

* defined in: [ComprobanteCompraInput](comprobantecomprainput-properties-numero.md "undefined#/properties/numero")

### numero Type

`integer`

### numero Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## ordenCompraId



`ordenCompraId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ComprobanteCompraInput](comprobantecomprainput-properties-ordencompraid.md "undefined#/properties/ordenCompraId")

### ordenCompraId Type

`integer`

### ordenCompraId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## prefijo



`prefijo`

* is required

* Type: `string`

* cannot be null

* defined in: [ComprobanteCompraInput](comprobantecomprainput-properties-prefijo.md "undefined#/properties/prefijo")

### prefijo Type

`string`

### prefijo Constraints

**maximum length**: the maximum number of characters for this string is: `4`

## proveedorId



`proveedorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ComprobanteCompraInput](comprobantecomprainput-properties-proveedorid.md "undefined#/properties/proveedorId")

### proveedorId Type

`integer`

### proveedorId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [ComprobanteCompraInput](comprobantecomprainput-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value | Explanation |
| :---- | :---------- |
| `"A"` |             |
| `"B"` |             |
| `"C"` |             |

## total



`total`

* is required

* Type: `number`

* cannot be null

* defined in: [ComprobanteCompraInput](comprobantecomprainput-properties-total.md "undefined#/properties/total")

### total Type

`number`

### total Constraints

**minimum**: the value of this number must greater than or equal to: `0`
