# ComprobanteCompra Schema

```txt
undefined#/properties/comprobanteCompra
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DocumentoCompraConfirmResult.schema.json\*](../schema-json/DocumentoCompraConfirmResult.schema.json "open original schema") |

## comprobanteCompra Type

`object` ([ComprobanteCompra](comprobantecompra.md))

# comprobanteCompra Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [cae](#cae)                     | `string`  | Optional | cannot be null | [ComprobanteCompra](comprobantecompra-properties-cae.md "undefined#/properties/cae")                     |
| [caeVto](#caevto)               | `string`  | Optional | cannot be null | [ComprobanteCompra](comprobantecompra-properties-caevto.md "undefined#/properties/caeVto")               |
| [createdAt](#createdat)         | `string`  | Required | cannot be null | [ComprobanteCompra](comprobantecompra-properties-createdat.md "undefined#/properties/createdAt")         |
| [estado](#estado)               | `string`  | Required | cannot be null | [ComprobanteCompra](comprobantecompra-properties-estado.md "undefined#/properties/estado")               |
| [fecha](#fecha)                 | `string`  | Required | cannot be null | [ComprobanteCompra](comprobantecompra-properties-fecha.md "undefined#/properties/fecha")                 |
| [id](#id)                       | `integer` | Required | cannot be null | [ComprobanteCompra](comprobantecompra-properties-id.md "undefined#/properties/id")                       |
| [iva1](#iva1)                   | `number`  | Required | cannot be null | [ComprobanteCompra](comprobantecompra-properties-iva1.md "undefined#/properties/iva1")                   |
| [iva2](#iva2)                   | `number`  | Required | cannot be null | [ComprobanteCompra](comprobantecompra-properties-iva2.md "undefined#/properties/iva2")                   |
| [neto1](#neto1)                 | `number`  | Required | cannot be null | [ComprobanteCompra](comprobantecompra-properties-neto1.md "undefined#/properties/neto1")                 |
| [neto2](#neto2)                 | `number`  | Required | cannot be null | [ComprobanteCompra](comprobantecompra-properties-neto2.md "undefined#/properties/neto2")                 |
| [neto3](#neto3)                 | `number`  | Required | cannot be null | [ComprobanteCompra](comprobantecompra-properties-neto3.md "undefined#/properties/neto3")                 |
| [numero](#numero)               | `integer` | Required | cannot be null | [ComprobanteCompra](comprobantecompra-properties-numero.md "undefined#/properties/numero")               |
| [ordenCompraId](#ordencompraid) | `integer` | Optional | cannot be null | [ComprobanteCompra](comprobantecompra-properties-ordencompraid.md "undefined#/properties/ordenCompraId") |
| [prefijo](#prefijo)             | `string`  | Required | cannot be null | [ComprobanteCompra](comprobantecompra-properties-prefijo.md "undefined#/properties/prefijo")             |
| [proveedorId](#proveedorid)     | `integer` | Required | cannot be null | [ComprobanteCompra](comprobantecompra-properties-proveedorid.md "undefined#/properties/proveedorId")     |
| [tenantId](#tenantid)           | `integer` | Required | cannot be null | [ComprobanteCompra](comprobantecompra-properties-tenantid.md "undefined#/properties/tenantId")           |
| [tipo](#tipo)                   | `string`  | Required | cannot be null | [ComprobanteCompra](comprobantecompra-properties-tipo.md "undefined#/properties/tipo")                   |
| [total](#total)                 | `number`  | Required | cannot be null | [ComprobanteCompra](comprobantecompra-properties-total.md "undefined#/properties/total")                 |
| [updatedAt](#updatedat)         | `string`  | Required | cannot be null | [ComprobanteCompra](comprobantecompra-properties-updatedat.md "undefined#/properties/updatedAt")         |

## cae



`cae`

* is optional

* Type: `string`

* cannot be null

* defined in: [ComprobanteCompra](comprobantecompra-properties-cae.md "undefined#/properties/cae")

### cae Type

`string`

## caeVto



`caeVto`

* is optional

* Type: `string`

* cannot be null

* defined in: [ComprobanteCompra](comprobantecompra-properties-caevto.md "undefined#/properties/caeVto")

### caeVto Type

`string`

### caeVto Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [ComprobanteCompra](comprobantecompra-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [ComprobanteCompra](comprobantecompra-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [ComprobanteCompra](comprobantecompra-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [ComprobanteCompra](comprobantecompra-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## iva1



`iva1`

* is required

* Type: `number`

* cannot be null

* defined in: [ComprobanteCompra](comprobantecompra-properties-iva1.md "undefined#/properties/iva1")

### iva1 Type

`number`

## iva2



`iva2`

* is required

* Type: `number`

* cannot be null

* defined in: [ComprobanteCompra](comprobantecompra-properties-iva2.md "undefined#/properties/iva2")

### iva2 Type

`number`

## neto1



`neto1`

* is required

* Type: `number`

* cannot be null

* defined in: [ComprobanteCompra](comprobantecompra-properties-neto1.md "undefined#/properties/neto1")

### neto1 Type

`number`

## neto2



`neto2`

* is required

* Type: `number`

* cannot be null

* defined in: [ComprobanteCompra](comprobantecompra-properties-neto2.md "undefined#/properties/neto2")

### neto2 Type

`number`

## neto3



`neto3`

* is required

* Type: `number`

* cannot be null

* defined in: [ComprobanteCompra](comprobantecompra-properties-neto3.md "undefined#/properties/neto3")

### neto3 Type

`number`

## numero



`numero`

* is required

* Type: `integer`

* cannot be null

* defined in: [ComprobanteCompra](comprobantecompra-properties-numero.md "undefined#/properties/numero")

### numero Type

`integer`

## ordenCompraId



`ordenCompraId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ComprobanteCompra](comprobantecompra-properties-ordencompraid.md "undefined#/properties/ordenCompraId")

### ordenCompraId Type

`integer`

## prefijo



`prefijo`

* is required

* Type: `string`

* cannot be null

* defined in: [ComprobanteCompra](comprobantecompra-properties-prefijo.md "undefined#/properties/prefijo")

### prefijo Type

`string`

## proveedorId



`proveedorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ComprobanteCompra](comprobantecompra-properties-proveedorid.md "undefined#/properties/proveedorId")

### proveedorId Type

`integer`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ComprobanteCompra](comprobantecompra-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [ComprobanteCompra](comprobantecompra-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

## total



`total`

* is required

* Type: `number`

* cannot be null

* defined in: [ComprobanteCompra](comprobantecompra-properties-total.md "undefined#/properties/total")

### total Type

`number`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [ComprobanteCompra](comprobantecompra-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
