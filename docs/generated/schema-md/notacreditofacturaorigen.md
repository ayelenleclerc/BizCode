# NotaCreditoFacturaOrigen Schema

```txt
undefined
```

Originating invoice header (selected columns)

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [NotaCreditoFacturaOrigen.schema.json](../schema-json/NotaCreditoFacturaOrigen.schema.json "open original schema") |

## NotaCreditoFacturaOrigen Type

`object` ([NotaCreditoFacturaOrigen](notacreditofacturaorigen.md))

# NotaCreditoFacturaOrigen Properties

| Property                | Type      | Required | Nullable       | Defined by                                                                                                     |
| :---------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid) | `integer` | Optional | cannot be null | [NotaCreditoFacturaOrigen](notacreditofacturaorigen-properties-clienteid.md "undefined#/properties/clienteId") |
| [estado](#estado)       | `string`  | Optional | cannot be null | [NotaCreditoFacturaOrigen](notacreditofacturaorigen-properties-estado.md "undefined#/properties/estado")       |
| [fecha](#fecha)         | `string`  | Optional | cannot be null | [NotaCreditoFacturaOrigen](notacreditofacturaorigen-properties-fecha.md "undefined#/properties/fecha")         |
| [id](#id)               | `integer` | Optional | cannot be null | [NotaCreditoFacturaOrigen](notacreditofacturaorigen-properties-id.md "undefined#/properties/id")               |
| [numero](#numero)       | `integer` | Optional | cannot be null | [NotaCreditoFacturaOrigen](notacreditofacturaorigen-properties-numero.md "undefined#/properties/numero")       |
| [prefijo](#prefijo)     | `string`  | Optional | cannot be null | [NotaCreditoFacturaOrigen](notacreditofacturaorigen-properties-prefijo.md "undefined#/properties/prefijo")     |
| [tipo](#tipo)           | `string`  | Optional | cannot be null | [NotaCreditoFacturaOrigen](notacreditofacturaorigen-properties-tipo.md "undefined#/properties/tipo")           |
| [total](#total)         | Merged    | Optional | cannot be null | [NotaCreditoFacturaOrigen](notacreditofacturaorigen-properties-total.md "undefined#/properties/total")         |
| Additional Properties   | Any       | Optional | can be null    |                                                                                                                |

## clienteId



`clienteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [NotaCreditoFacturaOrigen](notacreditofacturaorigen-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## estado



`estado`

* is optional

* Type: `string`

* cannot be null

* defined in: [NotaCreditoFacturaOrigen](notacreditofacturaorigen-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

## fecha



`fecha`

* is optional

* Type: `string`

* cannot be null

* defined in: [NotaCreditoFacturaOrigen](notacreditofacturaorigen-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [NotaCreditoFacturaOrigen](notacreditofacturaorigen-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## numero



`numero`

* is optional

* Type: `integer`

* cannot be null

* defined in: [NotaCreditoFacturaOrigen](notacreditofacturaorigen-properties-numero.md "undefined#/properties/numero")

### numero Type

`integer`

## prefijo



`prefijo`

* is optional

* Type: `string`

* cannot be null

* defined in: [NotaCreditoFacturaOrigen](notacreditofacturaorigen-properties-prefijo.md "undefined#/properties/prefijo")

### prefijo Type

`string`

## tipo



`tipo`

* is optional

* Type: `string`

* cannot be null

* defined in: [NotaCreditoFacturaOrigen](notacreditofacturaorigen-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

## total



`total`

* is optional

* Type: merged type ([Details](notacreditofacturaorigen-properties-total.md))

* cannot be null

* defined in: [NotaCreditoFacturaOrigen](notacreditofacturaorigen-properties-total.md "undefined#/properties/total")

### total Type

merged type ([Details](notacreditofacturaorigen-properties-total.md))

one (and only one) of

* [Untitled number in NotaCreditoFacturaOrigen](notacreditofacturaorigen-properties-total-oneof-0.md "check type definition")

* [Untitled string in NotaCreditoFacturaOrigen](notacreditofacturaorigen-properties-total-oneof-1.md "check type definition")

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
