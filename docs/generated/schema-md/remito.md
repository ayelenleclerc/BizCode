# Remito Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RemitoListEnvelope.schema.json\*](../schema-json/RemitoListEnvelope.schema.json "open original schema") |

## items Type

`object` ([Remito](remito.md))

# items Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                         |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------- |
| [clienteId](#clienteid)         | `integer` | Optional | cannot be null | [Remito](remito-properties-clienteid.md "undefined#/properties/clienteId")         |
| [estado](#estado)               | `string`  | Optional | cannot be null | [Remito](remito-properties-estado.md "undefined#/properties/estado")               |
| [facturaId](#facturaid)         | `integer` | Optional | cannot be null | [Remito](remito-properties-facturaid.md "undefined#/properties/facturaId")         |
| [fecha](#fecha)                 | `string`  | Optional | cannot be null | [Remito](remito-properties-fecha.md "undefined#/properties/fecha")                 |
| [fechaEntrega](#fechaentrega)   | `string`  | Optional | cannot be null | [Remito](remito-properties-fechaentrega.md "undefined#/properties/fechaEntrega")   |
| [firmadoPor](#firmadopor)       | `string`  | Optional | cannot be null | [Remito](remito-properties-firmadopor.md "undefined#/properties/firmadoPor")       |
| [id](#id)                       | `integer` | Optional | cannot be null | [Remito](remito-properties-id.md "undefined#/properties/id")                       |
| [items](#items)                 | `array`   | Optional | cannot be null | [Remito](remito-properties-items.md "undefined#/properties/items")                 |
| [numero](#numero)               | `integer` | Optional | cannot be null | [Remito](remito-properties-numero.md "undefined#/properties/numero")               |
| [observaciones](#observaciones) | `string`  | Optional | cannot be null | [Remito](remito-properties-observaciones.md "undefined#/properties/observaciones") |
| [pedidoId](#pedidoid)           | `integer` | Optional | cannot be null | [Remito](remito-properties-pedidoid.md "undefined#/properties/pedidoId")           |
| [prefijo](#prefijo)             | `string`  | Optional | cannot be null | [Remito](remito-properties-prefijo.md "undefined#/properties/prefijo")             |
| [referencia](#referencia)       | `string`  | Optional | cannot be null | [Remito](remito-properties-referencia.md "undefined#/properties/referencia")       |
| [tipo](#tipo)                   | `string`  | Optional | cannot be null | [Remito](remito-properties-tipo.md "undefined#/properties/tipo")                   |
| Additional Properties           | Any       | Optional | can be null    |                                                                                    |

## clienteId



`clienteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Remito](remito-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## estado



`estado`

* is optional

* Type: `string`

* cannot be null

* defined in: [Remito](remito-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value         | Explanation |
| :------------ | :---------- |
| `"borrador"`  |             |
| `"emitido"`   |             |
| `"entregado"` |             |
| `"anulado"`   |             |

## facturaId



`facturaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Remito](remito-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

## fecha



`fecha`

* is optional

* Type: `string`

* cannot be null

* defined in: [Remito](remito-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## fechaEntrega



`fechaEntrega`

* is optional

* Type: `string`

* cannot be null

* defined in: [Remito](remito-properties-fechaentrega.md "undefined#/properties/fechaEntrega")

### fechaEntrega Type

`string`

### fechaEntrega Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## firmadoPor



`firmadoPor`

* is optional

* Type: `string`

* cannot be null

* defined in: [Remito](remito-properties-firmadopor.md "undefined#/properties/firmadoPor")

### firmadoPor Type

`string`

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Remito](remito-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## items



`items`

* is optional

* Type: `object[]` ([Details](remito-properties-items-items.md))

* cannot be null

* defined in: [Remito](remito-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([Details](remito-properties-items-items.md))

## numero



`numero`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Remito](remito-properties-numero.md "undefined#/properties/numero")

### numero Type

`integer`

## observaciones



`observaciones`

* is optional

* Type: `string`

* cannot be null

* defined in: [Remito](remito-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

## pedidoId



`pedidoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Remito](remito-properties-pedidoid.md "undefined#/properties/pedidoId")

### pedidoId Type

`integer`

## prefijo



`prefijo`

* is optional

* Type: `string`

* cannot be null

* defined in: [Remito](remito-properties-prefijo.md "undefined#/properties/prefijo")

### prefijo Type

`string`

## referencia



`referencia`

* is optional

* Type: `string`

* cannot be null

* defined in: [Remito](remito-properties-referencia.md "undefined#/properties/referencia")

### referencia Type

`string`

## tipo



`tipo`

* is optional

* Type: `string`

* cannot be null

* defined in: [Remito](remito-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
