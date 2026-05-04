# Factura Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FacturaListEnvelope.schema.json\*](../schema-json/FacturaListEnvelope.schema.json "open original schema") |

## items Type

`object` ([Factura](factura.md))

# items Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                       |
| :-------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------- |
| [clienteId](#clienteid)     | `integer` | Optional | cannot be null | [Factura](factura-properties-clienteid.md "undefined#/properties/clienteId")     |
| [estado](#estado)           | `string`  | Optional | cannot be null | [Factura](factura-properties-estado.md "undefined#/properties/estado")           |
| [fecha](#fecha)             | `string`  | Optional | cannot be null | [Factura](factura-properties-fecha.md "undefined#/properties/fecha")             |
| [formaPagoId](#formapagoid) | `integer` | Optional | cannot be null | [Factura](factura-properties-formapagoid.md "undefined#/properties/formaPagoId") |
| [id](#id)                   | `integer` | Optional | cannot be null | [Factura](factura-properties-id.md "undefined#/properties/id")                   |
| [items](#items)             | `array`   | Optional | cannot be null | [Factura](factura-properties-items.md "undefined#/properties/items")             |
| [iva1](#iva1)               | `number`  | Optional | cannot be null | [Factura](factura-properties-iva1.md "undefined#/properties/iva1")               |
| [iva2](#iva2)               | `number`  | Optional | cannot be null | [Factura](factura-properties-iva2.md "undefined#/properties/iva2")               |
| [neto1](#neto1)             | `number`  | Optional | cannot be null | [Factura](factura-properties-neto1.md "undefined#/properties/neto1")             |
| [neto2](#neto2)             | `number`  | Optional | cannot be null | [Factura](factura-properties-neto2.md "undefined#/properties/neto2")             |
| [neto3](#neto3)             | `number`  | Optional | cannot be null | [Factura](factura-properties-neto3.md "undefined#/properties/neto3")             |
| [numero](#numero)           | `integer` | Optional | cannot be null | [Factura](factura-properties-numero.md "undefined#/properties/numero")           |
| [prefijo](#prefijo)         | `string`  | Optional | cannot be null | [Factura](factura-properties-prefijo.md "undefined#/properties/prefijo")         |
| [tipo](#tipo)               | `string`  | Optional | cannot be null | [Factura](factura-properties-tipo.md "undefined#/properties/tipo")               |
| [total](#total)             | `number`  | Optional | cannot be null | [Factura](factura-properties-total.md "undefined#/properties/total")             |
| Additional Properties       | Any       | Optional | can be null    |                                                                                  |

## clienteId



`clienteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Factura](factura-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## estado



`estado`

* is optional

* Type: `string`

* cannot be null

* defined in: [Factura](factura-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

## fecha



`fecha`

* is optional

* Type: `string`

* cannot be null

* defined in: [Factura](factura-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## formaPagoId



`formaPagoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Factura](factura-properties-formapagoid.md "undefined#/properties/formaPagoId")

### formaPagoId Type

`integer`

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Factura](factura-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## items



`items`

* is optional

* Type: `object[]` ([FacturaItem](facturaitem.md))

* cannot be null

* defined in: [Factura](factura-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([FacturaItem](facturaitem.md))

## iva1



`iva1`

* is optional

* Type: `number`

* cannot be null

* defined in: [Factura](factura-properties-iva1.md "undefined#/properties/iva1")

### iva1 Type

`number`

## iva2



`iva2`

* is optional

* Type: `number`

* cannot be null

* defined in: [Factura](factura-properties-iva2.md "undefined#/properties/iva2")

### iva2 Type

`number`

## neto1



`neto1`

* is optional

* Type: `number`

* cannot be null

* defined in: [Factura](factura-properties-neto1.md "undefined#/properties/neto1")

### neto1 Type

`number`

## neto2



`neto2`

* is optional

* Type: `number`

* cannot be null

* defined in: [Factura](factura-properties-neto2.md "undefined#/properties/neto2")

### neto2 Type

`number`

## neto3



`neto3`

* is optional

* Type: `number`

* cannot be null

* defined in: [Factura](factura-properties-neto3.md "undefined#/properties/neto3")

### neto3 Type

`number`

## numero



`numero`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Factura](factura-properties-numero.md "undefined#/properties/numero")

### numero Type

`integer`

## prefijo



`prefijo`

* is optional

* Type: `string`

* cannot be null

* defined in: [Factura](factura-properties-prefijo.md "undefined#/properties/prefijo")

### prefijo Type

`string`

## tipo



`tipo`

* is optional

* Type: `string`

* cannot be null

* defined in: [Factura](factura-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

## total



`total`

* is optional

* Type: `number`

* cannot be null

* defined in: [Factura](factura-properties-total.md "undefined#/properties/total")

### total Type

`number`

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
