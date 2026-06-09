# RepartoItemLine Schema

```txt
undefined#/allOf/0
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoItemPod.schema.json\*](../schema-json/RepartoItemPod.schema.json "open original schema") |

## 0 Type

`object` ([RepartoItemLine](repartoitemline.md))

# 0 Properties

| Property                            | Type      | Required | Nullable       | Defined by                                                                                               |
| :---------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [entregadoAt](#entregadoat)         | `string`  | Optional | cannot be null | [RepartoItemLine](repartoitemline-properties-entregadoat.md "undefined#/properties/entregadoAt")         |
| [estado](#estado)                   | `string`  | Required | cannot be null | [RepartoItemLine](repartoitemline-properties-estado.md "undefined#/properties/estado")                   |
| [hasPod](#haspod)                   | `boolean` | Required | cannot be null | [RepartoItemLine](repartoitemline-properties-haspod.md "undefined#/properties/hasPod")                   |
| [id](#id)                           | `integer` | Required | cannot be null | [RepartoItemLine](repartoitemline-properties-id.md "undefined#/properties/id")                           |
| [motivoNoEntrega](#motivonoentrega) | `string`  | Optional | cannot be null | [RepartoItemLine](repartoitemline-properties-motivonoentrega.md "undefined#/properties/motivoNoEntrega") |
| [notasEntrega](#notasentrega)       | `string`  | Optional | cannot be null | [RepartoItemLine](repartoitemline-properties-notasentrega.md "undefined#/properties/notasEntrega")       |
| [ordenEntrega](#ordenentrega)       | `object`  | Required | cannot be null | [RepartoItemLine](ordenentrega.md "undefined#/properties/ordenEntrega")                                  |
| [ordenEntregaId](#ordenentregaid)   | `integer` | Required | cannot be null | [RepartoItemLine](repartoitemline-properties-ordenentregaid.md "undefined#/properties/ordenEntregaId")   |
| [receptorDni](#receptordni)         | `string`  | Optional | cannot be null | [RepartoItemLine](repartoitemline-properties-receptordni.md "undefined#/properties/receptorDni")         |
| [receptorNombre](#receptornombre)   | `string`  | Optional | cannot be null | [RepartoItemLine](repartoitemline-properties-receptornombre.md "undefined#/properties/receptorNombre")   |
| [secuencia](#secuencia)             | `integer` | Required | cannot be null | [RepartoItemLine](repartoitemline-properties-secuencia.md "undefined#/properties/secuencia")             |

## entregadoAt



`entregadoAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [RepartoItemLine](repartoitemline-properties-entregadoat.md "undefined#/properties/entregadoAt")

### entregadoAt Type

`string`

### entregadoAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [RepartoItemLine](repartoitemline-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value             | Explanation |
| :---------------- | :---------- |
| `"pending"`       |             |
| `"delivered"`     |             |
| `"not_delivered"` |             |
| `"returned"`      |             |

## hasPod



`hasPod`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RepartoItemLine](repartoitemline-properties-haspod.md "undefined#/properties/hasPod")

### hasPod Type

`boolean`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [RepartoItemLine](repartoitemline-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## motivoNoEntrega



`motivoNoEntrega`

* is optional

* Type: `string`

* cannot be null

* defined in: [RepartoItemLine](repartoitemline-properties-motivonoentrega.md "undefined#/properties/motivoNoEntrega")

### motivoNoEntrega Type

`string`

## notasEntrega



`notasEntrega`

* is optional

* Type: `string`

* cannot be null

* defined in: [RepartoItemLine](repartoitemline-properties-notasentrega.md "undefined#/properties/notasEntrega")

### notasEntrega Type

`string`

## ordenEntrega



`ordenEntrega`

* is required

* Type: `object` ([OrdenEntrega](ordenentrega.md))

* cannot be null

* defined in: [RepartoItemLine](ordenentrega.md "undefined#/properties/ordenEntrega")

### ordenEntrega Type

`object` ([OrdenEntrega](ordenentrega.md))

## ordenEntregaId



`ordenEntregaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [RepartoItemLine](repartoitemline-properties-ordenentregaid.md "undefined#/properties/ordenEntregaId")

### ordenEntregaId Type

`integer`

## receptorDni



`receptorDni`

* is optional

* Type: `string`

* cannot be null

* defined in: [RepartoItemLine](repartoitemline-properties-receptordni.md "undefined#/properties/receptorDni")

### receptorDni Type

`string`

## receptorNombre



`receptorNombre`

* is optional

* Type: `string`

* cannot be null

* defined in: [RepartoItemLine](repartoitemline-properties-receptornombre.md "undefined#/properties/receptorNombre")

### receptorNombre Type

`string`

## secuencia



`secuencia`

* is required

* Type: `integer`

* cannot be null

* defined in: [RepartoItemLine](repartoitemline-properties-secuencia.md "undefined#/properties/secuencia")

### secuencia Type

`integer`
