# PedidoInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PedidoInput.schema.json](../schema-json/PedidoInput.schema.json "open original schema") |

## PedidoInput Type

`object` ([PedidoInput](pedidoinput.md))

# PedidoInput Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                           |
| :-------------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid)                 | `integer` | Required | cannot be null | [PedidoInput](pedidoinput-properties-clienteid.md "undefined#/properties/clienteId")                 |
| [condicionCobro](#condicioncobro)       | `string`  | Optional | cannot be null | [PedidoInput](pedidoinput-properties-condicioncobro.md "undefined#/properties/condicionCobro")       |
| [despachanteEmail](#despachanteemail)   | `string`  | Optional | cannot be null | [PedidoInput](pedidoinput-properties-despachanteemail.md "undefined#/properties/despachanteEmail")   |
| [despachanteNombre](#despachantenombre) | `string`  | Optional | cannot be null | [PedidoInput](pedidoinput-properties-despachantenombre.md "undefined#/properties/despachanteNombre") |
| [incoterm](#incoterm)                   | Merged    | Optional | cannot be null | [PedidoInput](pedidoinput-properties-incoterm.md "undefined#/properties/incoterm")                   |
| [items](#items)                         | `array`   | Required | cannot be null | [PedidoInput](pedidoinput-properties-items.md "undefined#/properties/items")                         |
| [observaciones](#observaciones)         | `string`  | Optional | cannot be null | [PedidoInput](pedidoinput-properties-observaciones.md "undefined#/properties/observaciones")         |
| [paisDestino](#paisdestino)             | `string`  | Optional | cannot be null | [PedidoInput](pedidoinput-properties-paisdestino.md "undefined#/properties/paisDestino")             |
| [plazoDias](#plazodias)                 | `integer` | Optional | cannot be null | [PedidoInput](pedidoinput-properties-plazodias.md "undefined#/properties/plazoDias")                 |
| [validUntil](#validuntil)               | `string`  | Optional | cannot be null | [PedidoInput](pedidoinput-properties-validuntil.md "undefined#/properties/validUntil")               |
| [vendedorId](#vendedorid)               | `integer` | Optional | cannot be null | [PedidoInput](pedidoinput-properties-vendedorid.md "undefined#/properties/vendedorId")               |

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [PedidoInput](pedidoinput-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

### clienteId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## condicionCobro

Intended collection terms (#169).

`condicionCobro`

* is optional

* Type: `string`

* cannot be null

* defined in: [PedidoInput](pedidoinput-properties-condicioncobro.md "undefined#/properties/condicionCobro")

### condicionCobro Type

`string`

### condicionCobro Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                | Explanation |
| :------------------- | :---------- |
| `"contado"`          |             |
| `"cuenta_corriente"` |             |
| `"plazo"`            |             |
| `null`               |             |

## despachanteEmail



`despachanteEmail`

* is optional

* Type: `string`

* cannot be null

* defined in: [PedidoInput](pedidoinput-properties-despachanteemail.md "undefined#/properties/despachanteEmail")

### despachanteEmail Type

`string`

### despachanteEmail Constraints

**maximum length**: the maximum number of characters for this string is: `160`

**email**: the string must be an email address, according to [RFC 5322, section 3.4.1](https://tools.ietf.org/html/rfc5322 "check the specification")

## despachanteNombre

Customs broker name; requires `despachanteEmail` (#206).

`despachanteNombre`

* is optional

* Type: `string`

* cannot be null

* defined in: [PedidoInput](pedidoinput-properties-despachantenombre.md "undefined#/properties/despachanteNombre")

### despachanteNombre Type

`string`

### despachanteNombre Constraints

**maximum length**: the maximum number of characters for this string is: `120`

## incoterm



`incoterm`

* is optional

* Type: merged type ([Details](pedidoinput-properties-incoterm.md))

* cannot be null

* defined in: [PedidoInput](pedidoinput-properties-incoterm.md "undefined#/properties/incoterm")

### incoterm Type

merged type ([Details](pedidoinput-properties-incoterm.md))

all of

* [Incoterm](incoterm.md "check type definition")

## items



`items`

* is required

* Type: `object[]` ([Details](pedidoinput-properties-items-items.md))

* cannot be null

* defined in: [PedidoInput](pedidoinput-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([Details](pedidoinput-properties-items-items.md))

### items Constraints

**minimum number of items**: the minimum number of items for this array is: `1`

## observaciones

Warehouse notes (#169).

`observaciones`

* is optional

* Type: `string`

* cannot be null

* defined in: [PedidoInput](pedidoinput-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

### observaciones Constraints

**maximum length**: the maximum number of characters for this string is: `500`

## paisDestino

ISO-3166-1 alpha-2 destination country (#206).

`paisDestino`

* is optional

* Type: `string`

* cannot be null

* defined in: [PedidoInput](pedidoinput-properties-paisdestino.md "undefined#/properties/paisDestino")

### paisDestino Type

`string`

### paisDestino Constraints

**maximum length**: the maximum number of characters for this string is: `2`

**minimum length**: the minimum number of characters for this string is: `2`

## plazoDias

Required when condicionCobro is plazo (#169).

`plazoDias`

* is optional

* Type: `integer`

* cannot be null

* defined in: [PedidoInput](pedidoinput-properties-plazodias.md "undefined#/properties/plazoDias")

### plazoDias Type

`integer`

### plazoDias Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## validUntil



`validUntil`

* is optional

* Type: `string`

* cannot be null

* defined in: [PedidoInput](pedidoinput-properties-validuntil.md "undefined#/properties/validUntil")

### validUntil Type

`string`

## vendedorId



`vendedorId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [PedidoInput](pedidoinput-properties-vendedorid.md "undefined#/properties/vendedorId")

### vendedorId Type

`integer`
