# RepartoItemPodInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoItemPodInput.schema.json](../schema-json/RepartoItemPodInput.schema.json "open original schema") |

## RepartoItemPodInput Type

`object` ([RepartoItemPodInput](repartoitempodinput.md))

# RepartoItemPodInput Properties

| Property                            | Type     | Required | Nullable       | Defined by                                                                                                       |
| :---------------------------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [firmaBase64](#firmabase64)         | `string` | Optional | cannot be null | [RepartoItemPodInput](repartoitempodinput-properties-firmabase64.md "undefined#/properties/firmaBase64")         |
| [fotoBase64](#fotobase64)           | `string` | Optional | cannot be null | [RepartoItemPodInput](repartoitempodinput-properties-fotobase64.md "undefined#/properties/fotoBase64")           |
| [motivoNoEntrega](#motivonoentrega) | `string` | Optional | cannot be null | [RepartoItemPodInput](repartoitempodinput-properties-motivonoentrega.md "undefined#/properties/motivoNoEntrega") |
| [notasEntrega](#notasentrega)       | `string` | Optional | cannot be null | [RepartoItemPodInput](repartoitempodinput-properties-notasentrega.md "undefined#/properties/notasEntrega")       |
| [outcome](#outcome)                 | `string` | Required | cannot be null | [RepartoItemPodInput](repartoitempodinput-properties-outcome.md "undefined#/properties/outcome")                 |
| [receptorDni](#receptordni)         | `string` | Optional | cannot be null | [RepartoItemPodInput](repartoitempodinput-properties-receptordni.md "undefined#/properties/receptorDni")         |
| [receptorNombre](#receptornombre)   | `string` | Optional | cannot be null | [RepartoItemPodInput](repartoitempodinput-properties-receptornombre.md "undefined#/properties/receptorNombre")   |

## firmaBase64

Data URL or base64 signature; max \~50KB decoded when delivered.

`firmaBase64`

* is optional

* Type: `string`

* cannot be null

* defined in: [RepartoItemPodInput](repartoitempodinput-properties-firmabase64.md "undefined#/properties/firmaBase64")

### firmaBase64 Type

`string`

## fotoBase64

Data URL or base64 photo; max \~200KB decoded.

`fotoBase64`

* is optional

* Type: `string`

* cannot be null

* defined in: [RepartoItemPodInput](repartoitempodinput-properties-fotobase64.md "undefined#/properties/fotoBase64")

### fotoBase64 Type

`string`

## motivoNoEntrega



`motivoNoEntrega`

* is optional

* Type: `string`

* cannot be null

* defined in: [RepartoItemPodInput](repartoitempodinput-properties-motivonoentrega.md "undefined#/properties/motivoNoEntrega")

### motivoNoEntrega Type

`string`

### motivoNoEntrega Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                    | Explanation |
| :----------------------- | :---------- |
| `"ausente"`              |             |
| `"rechazo"`              |             |
| `"domicilio_incorrecto"` |             |
| `"producto_dañado"`      |             |
| `"otro"`                 |             |

## notasEntrega



`notasEntrega`

* is optional

* Type: `string`

* cannot be null

* defined in: [RepartoItemPodInput](repartoitempodinput-properties-notasentrega.md "undefined#/properties/notasEntrega")

### notasEntrega Type

`string`

### notasEntrega Constraints

**maximum length**: the maximum number of characters for this string is: `500`

## outcome



`outcome`

* is required

* Type: `string`

* cannot be null

* defined in: [RepartoItemPodInput](repartoitempodinput-properties-outcome.md "undefined#/properties/outcome")

### outcome Type

`string`

### outcome Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value             | Explanation |
| :---------------- | :---------- |
| `"delivered"`     |             |
| `"not_delivered"` |             |

## receptorDni



`receptorDni`

* is optional

* Type: `string`

* cannot be null

* defined in: [RepartoItemPodInput](repartoitempodinput-properties-receptordni.md "undefined#/properties/receptorDni")

### receptorDni Type

`string`

### receptorDni Constraints

**maximum length**: the maximum number of characters for this string is: `20`

## receptorNombre



`receptorNombre`

* is optional

* Type: `string`

* cannot be null

* defined in: [RepartoItemPodInput](repartoitempodinput-properties-receptornombre.md "undefined#/properties/receptorNombre")

### receptorNombre Type

`string`

### receptorNombre Constraints

**maximum length**: the maximum number of characters for this string is: `120`
