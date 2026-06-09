# Cobro Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CobroListEnvelope.schema.json\*](../schema-json/CobroListEnvelope.schema.json "open original schema") |

## items Type

`object` ([Cobro](cobro.md))

# items Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                   |
| :-------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------- |
| [cliente](#cliente)         | `object`  | Optional | cannot be null | [Cobro](cobro-properties-cliente.md "undefined#/properties/cliente")         |
| [clienteId](#clienteid)     | `integer` | Optional | cannot be null | [Cobro](cobro-properties-clienteid.md "undefined#/properties/clienteId")     |
| [fecha](#fecha)             | `string`  | Optional | cannot be null | [Cobro](cobro-properties-fecha.md "undefined#/properties/fecha")             |
| [formaPagoId](#formapagoid) | `integer` | Optional | cannot be null | [Cobro](cobro-properties-formapagoid.md "undefined#/properties/formaPagoId") |
| [id](#id)                   | `integer` | Optional | cannot be null | [Cobro](cobro-properties-id.md "undefined#/properties/id")                   |
| [monto](#monto)             | `number`  | Optional | cannot be null | [Cobro](cobro-properties-monto.md "undefined#/properties/monto")             |
| [nota](#nota)               | `string`  | Optional | cannot be null | [Cobro](cobro-properties-nota.md "undefined#/properties/nota")               |
| [referencia](#referencia)   | `string`  | Optional | cannot be null | [Cobro](cobro-properties-referencia.md "undefined#/properties/referencia")   |
| [tenantId](#tenantid)       | `integer` | Optional | cannot be null | [Cobro](cobro-properties-tenantid.md "undefined#/properties/tenantId")       |
| Additional Properties       | Any       | Optional | can be null    |                                                                              |

## cliente



`cliente`

* is optional

* Type: `object` ([Details](cobro-properties-cliente.md))

* cannot be null

* defined in: [Cobro](cobro-properties-cliente.md "undefined#/properties/cliente")

### cliente Type

`object` ([Details](cobro-properties-cliente.md))

## clienteId



`clienteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Cobro](cobro-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## fecha



`fecha`

* is optional

* Type: `string`

* cannot be null

* defined in: [Cobro](cobro-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## formaPagoId



`formaPagoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Cobro](cobro-properties-formapagoid.md "undefined#/properties/formaPagoId")

### formaPagoId Type

`integer`

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Cobro](cobro-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## monto



`monto`

* is optional

* Type: `number`

* cannot be null

* defined in: [Cobro](cobro-properties-monto.md "undefined#/properties/monto")

### monto Type

`number`

## nota



`nota`

* is optional

* Type: `string`

* cannot be null

* defined in: [Cobro](cobro-properties-nota.md "undefined#/properties/nota")

### nota Type

`string`

## referencia



`referencia`

* is optional

* Type: `string`

* cannot be null

* defined in: [Cobro](cobro-properties-referencia.md "undefined#/properties/referencia")

### referencia Type

`string`

## tenantId



`tenantId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Cobro](cobro-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
