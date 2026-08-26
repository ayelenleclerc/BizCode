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

| Property                              | Type      | Required | Nullable       | Defined by                                                                                           |
| :------------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid)               | `integer` | Required | cannot be null | [FacturaInput](facturainput-properties-clienteid.md "undefined#/properties/clienteId")               |
| [confirmAnomalies](#confirmanomalies) | `boolean` | Optional | cannot be null | [FacturaInput](facturainput-properties-confirmanomalies.md "undefined#/properties/confirmAnomalies") |
| [fecha](#fecha)                       | `string`  | Required | cannot be null | [FacturaInput](facturainput-properties-fecha.md "undefined#/properties/fecha")                       |
| [formaPagoId](#formapagoid)           | `integer` | Optional | cannot be null | [FacturaInput](facturainput-properties-formapagoid.md "undefined#/properties/formaPagoId")           |
| [items](#items)                       | `array`   | Required | cannot be null | [FacturaInput](facturainput-properties-items.md "undefined#/properties/items")                       |
| [iva1](#iva1)                         | `number`  | Required | cannot be null | [FacturaInput](facturainput-properties-iva1.md "undefined#/properties/iva1")                         |
| [iva2](#iva2)                         | `number`  | Required | cannot be null | [FacturaInput](facturainput-properties-iva2.md "undefined#/properties/iva2")                         |
| [neto1](#neto1)                       | `number`  | Required | cannot be null | [FacturaInput](facturainput-properties-neto1.md "undefined#/properties/neto1")                       |
| [neto2](#neto2)                       | `number`  | Required | cannot be null | [FacturaInput](facturainput-properties-neto2.md "undefined#/properties/neto2")                       |
| [neto3](#neto3)                       | `number`  | Required | cannot be null | [FacturaInput](facturainput-properties-neto3.md "undefined#/properties/neto3")                       |
| [numero](#numero)                     | `integer` | Required | cannot be null | [FacturaInput](facturainput-properties-numero.md "undefined#/properties/numero")                     |
| [percepciones](#percepciones)         | `array`   | Optional | cannot be null | [FacturaInput](facturainput-properties-percepciones.md "undefined#/properties/percepciones")         |
| [prefijo](#prefijo)                   | `string`  | Optional | cannot be null | [FacturaInput](facturainput-properties-prefijo.md "undefined#/properties/prefijo")                   |
| [puntosCanje](#puntoscanje)           | `integer` | Optional | cannot be null | [FacturaInput](facturainput-properties-puntoscanje.md "undefined#/properties/puntosCanje")           |
| [tipo](#tipo)                         | `string`  | Required | cannot be null | [FacturaInput](facturainput-properties-tipo.md "undefined#/properties/tipo")                         |
| [total](#total)                       | `number`  | Required | cannot be null | [FacturaInput](facturainput-properties-total.md "undefined#/properties/total")                       |

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## confirmAnomalies

When true, acknowledges soft-blocked duplicate anomaly and proceeds with create (#200). Required to create after HTTP 422 DUPLICATE\_INVOICE\_CONFIRM\_REQUIRED.

`confirmAnomalies`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-confirmanomalies.md "undefined#/properties/confirmAnomalies")

### confirmAnomalies Type

`boolean`

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

## percepciones



`percepciones`

* is optional

* Type: `object[]` ([ReciboPagoRetencionInput](recibopagoretencioninput.md))

* cannot be null

* defined in: [FacturaInput](facturainput-properties-percepciones.md "undefined#/properties/percepciones")

### percepciones Type

`object[]` ([ReciboPagoRetencionInput](recibopagoretencioninput.md))

## prefijo



`prefijo`

* is optional

* Type: `string`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-prefijo.md "undefined#/properties/prefijo")

### prefijo Type

`string`

## puntosCanje

Optional loyalty points to redeem as a negative invoice line (#250).

`puntosCanje`

* is optional

* Type: `integer`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-puntoscanje.md "undefined#/properties/puntosCanje")

### puntosCanje Type

`integer`

### puntosCanje Constraints

**minimum**: the value of this number must greater than or equal to: `1`

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

Must equal netos + IVA + sum(percepciones) when percepciones are sent (#229).

`total`

* is required

* Type: `number`

* cannot be null

* defined in: [FacturaInput](facturainput-properties-total.md "undefined#/properties/total")

### total Type

`number`
