# OrdenProduccionCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenProduccionCreateInput.schema.json](../schema-json/OrdenProduccionCreateInput.schema.json "open original schema") |

## OrdenProduccionCreateInput Type

`object` ([OrdenProduccionCreateInput](ordenproduccioncreateinput.md))

# OrdenProduccionCreateInput Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                                                   |
| :-------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)         | `integer` | Required | cannot be null | [OrdenProduccionCreateInput](ordenproduccioncreateinput-properties-articuloid.md "undefined#/properties/articuloId")         |
| [cantidadPlanif](#cantidadplanif) | `number`  | Required | cannot be null | [OrdenProduccionCreateInput](ordenproduccioncreateinput-properties-cantidadplanif.md "undefined#/properties/cantidadPlanif") |
| [depositoId](#depositoid)         | `integer` | Optional | cannot be null | [OrdenProduccionCreateInput](ordenproduccioncreateinput-properties-depositoid.md "undefined#/properties/depositoId")         |
| [fechaPlanif](#fechaplanif)       | `string`  | Optional | cannot be null | [OrdenProduccionCreateInput](ordenproduccioncreateinput-properties-fechaplanif.md "undefined#/properties/fechaPlanif")       |
| [observaciones](#observaciones)   | `string`  | Optional | cannot be null | [OrdenProduccionCreateInput](ordenproduccioncreateinput-properties-observaciones.md "undefined#/properties/observaciones")   |
| [operadorId](#operadorid)         | `integer` | Optional | cannot be null | [OrdenProduccionCreateInput](ordenproduccioncreateinput-properties-operadorid.md "undefined#/properties/operadorId")         |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenProduccionCreateInput](ordenproduccioncreateinput-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## cantidadPlanif



`cantidadPlanif`

* is required

* Type: `number`

* cannot be null

* defined in: [OrdenProduccionCreateInput](ordenproduccioncreateinput-properties-cantidadplanif.md "undefined#/properties/cantidadPlanif")

### cantidadPlanif Type

`number`

### cantidadPlanif Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`

## depositoId



`depositoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenProduccionCreateInput](ordenproduccioncreateinput-properties-depositoid.md "undefined#/properties/depositoId")

### depositoId Type

`integer`

### depositoId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## fechaPlanif



`fechaPlanif`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenProduccionCreateInput](ordenproduccioncreateinput-properties-fechaplanif.md "undefined#/properties/fechaPlanif")

### fechaPlanif Type

`string`

### fechaPlanif Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## observaciones



`observaciones`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenProduccionCreateInput](ordenproduccioncreateinput-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

### observaciones Constraints

**maximum length**: the maximum number of characters for this string is: `500`

## operadorId



`operadorId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenProduccionCreateInput](ordenproduccioncreateinput-properties-operadorid.md "undefined#/properties/operadorId")

### operadorId Type

`integer`

### operadorId Constraints

**minimum**: the value of this number must greater than or equal to: `1`
