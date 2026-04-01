# FacturaInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FacturaInput.schema.json](../schema-json/FacturaInput.schema.json "open original schema") |

## FacturaInput Type

`object` ([FacturaInput](facturainput.md))

# FacturaInput Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                 |
| :-------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [clienteId](#clienteid)     | `integer` | Required | cannot be null | [FacturaInput](facturainput-properties-clienteid.md "undefined#/properties/clienteId")     |
| [fecha](#fecha)             | `string`  | Required | cannot be null | [FacturaInput](facturainput-properties-fecha.md "undefined#/properties/fecha")             |
| [formaPagoId](#formapagoid) | `integer` | Optional | cannot be null | [FacturaInput](facturainput-properties-formapagoid.md "undefined#/properties/formaPagoId") |
| [items](#items)             | `array`   | Required | cannot be null | [FacturaInput](facturainput-properties-items.md "undefined#/properties/items")             |
| [iva1](#iva1)               | `number`  | Required | cannot be null | [FacturaInput](facturainput-properties-iva1.md "undefined#/properties/iva1")               |
| [iva2](#iva2)               | `number`  | Required | cannot be null | [FacturaInput](facturainput-properties-iva2.md "undefined#/properties/iva2")               |
| [neto1](#neto1)             | `number`  | Required | cannot be null | [FacturaInput](facturainput-properties-neto1.md "undefined#/properties/neto1")             |
| [neto2](#neto2)             | `number`  | Required | cannot be null | [FacturaInput](facturainput-properties-neto2.md "undefined#/properties/neto2")             |
| [neto3](#neto3)             | `number`  | Required | cannot be null | [FacturaInput](facturainput-properties-neto3.md "undefined#/properties/neto3")             |
| [numero](#numero)           | `integer` | Required | cannot be null | [FacturaInput](facturainput-properties-numero.md "undefined#/properties/numero")           |
| [prefijo](#prefijo)         | `string`  | Optional | cannot be null | [FacturaInput](facturainput-properties-prefijo.md "undefined#/properties/prefijo")         |
| [tipo](#tipo)               | `string`  | Required | cannot be null | [FacturaInput](facturainput-properties-tipo.md "undefined#/properties/tipo")               |
| [total](#total)             | `number`  | Required | cannot be null | [FacturaInput](facturainput-properties-total.md "undefined#/properties/total")             |

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## formaPagoId



`formaPagoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-formapagoid.md "undefined#/properties/formaPagoId")

### formaPagoId Type

`integer`

## items



`items`

* is required

* Type: `object[]` ([Details](facturainput-properties-items-items.md))

* cannot be null

* defined in: [FacturaInput](facturainput-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([Details](facturainput-properties-items-items.md))

## iva1



`iva1`

* is required

* Type: `number`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-iva1.md "undefined#/properties/iva1")

### iva1 Type

`number`

## iva2



`iva2`

* is required

* Type: `number`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-iva2.md "undefined#/properties/iva2")

### iva2 Type

`number`

## neto1



`neto1`

* is required

* Type: `number`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-neto1.md "undefined#/properties/neto1")

### neto1 Type

`number`

## neto2



`neto2`

* is required

* Type: `number`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-neto2.md "undefined#/properties/neto2")

### neto2 Type

`number`

## neto3



`neto3`

* is required

* Type: `number`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-neto3.md "undefined#/properties/neto3")

### neto3 Type

`number`

## numero



`numero`

* is required

* Type: `integer`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-numero.md "undefined#/properties/numero")

### numero Type

`integer`

## prefijo



`prefijo`

* is optional

* Type: `string`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-prefijo.md "undefined#/properties/prefijo")

### prefijo Type

`string`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value | Explanation |
| :---- | :---------- |
| `"A"` |             |
| `"B"` |             |

## total



`total`

* is required

* Type: `number`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-total.md "undefined#/properties/total")

### total Type

`number`
