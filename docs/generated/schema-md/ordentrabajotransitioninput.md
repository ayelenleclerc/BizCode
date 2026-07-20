# OrdenTrabajoTransitionInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenTrabajoTransitionInput.schema.json](../schema-json/OrdenTrabajoTransitionInput.schema.json "open original schema") |

## OrdenTrabajoTransitionInput Type

`object` ([OrdenTrabajoTransitionInput](ordentrabajotransitioninput.md))

# OrdenTrabajoTransitionInput Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                                                         |
| :------------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| [diagnostico](#diagnostico)           | `string`  | Optional | cannot be null | [OrdenTrabajoTransitionInput](ordentrabajotransitioninput-properties-diagnostico.md "undefined#/properties/diagnostico")           |
| [estado](#estado)                     | `string`  | Required | cannot be null | [OrdenTrabajoTransitionInput](ordentrabajoestado.md "undefined#/properties/estado")                                                |
| [fechaEntrega](#fechaentrega)         | `string`  | Optional | cannot be null | [OrdenTrabajoTransitionInput](ordentrabajotransitioninput-properties-fechaentrega.md "undefined#/properties/fechaEntrega")         |
| [fechaPromesa](#fechapromesa)         | `string`  | Optional | cannot be null | [OrdenTrabajoTransitionInput](ordentrabajotransitioninput-properties-fechapromesa.md "undefined#/properties/fechaPromesa")         |
| [items](#items)                       | `array`   | Optional | cannot be null | [OrdenTrabajoTransitionInput](ordentrabajotransitioninput-properties-items.md "undefined#/properties/items")                       |
| [observaciones](#observaciones)       | `string`  | Optional | cannot be null | [OrdenTrabajoTransitionInput](ordentrabajotransitioninput-properties-observaciones.md "undefined#/properties/observaciones")       |
| [tecnicoId](#tecnicoid)               | `integer` | Optional | cannot be null | [OrdenTrabajoTransitionInput](ordentrabajotransitioninput-properties-tecnicoid.md "undefined#/properties/tecnicoId")               |
| [trabajoRealizado](#trabajorealizado) | `string`  | Optional | cannot be null | [OrdenTrabajoTransitionInput](ordentrabajotransitioninput-properties-trabajorealizado.md "undefined#/properties/trabajoRealizado") |

## diagnostico



`diagnostico`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenTrabajoTransitionInput](ordentrabajotransitioninput-properties-diagnostico.md "undefined#/properties/diagnostico")

### diagnostico Type

`string`

## estado



`estado`

* is required

* Type: `string` ([OrdenTrabajoEstado](ordentrabajoestado.md))

* cannot be null

* defined in: [OrdenTrabajoTransitionInput](ordentrabajoestado.md "undefined#/properties/estado")

### estado Type

`string` ([OrdenTrabajoEstado](ordentrabajoestado.md))

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value              | Explanation |
| :----------------- | :---------- |
| `"recibido"`       |             |
| `"diagnosticado"`  |             |
| `"presupuestado"`  |             |
| `"aprobado"`       |             |
| `"en_reparacion"`  |             |
| `"listo"`          |             |
| `"entregado"`      |             |
| `"facturado"`      |             |
| `"cancelado"`      |             |
| `"sin_reparacion"` |             |

## fechaEntrega



`fechaEntrega`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenTrabajoTransitionInput](ordentrabajotransitioninput-properties-fechaentrega.md "undefined#/properties/fechaEntrega")

### fechaEntrega Type

`string`

## fechaPromesa



`fechaPromesa`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenTrabajoTransitionInput](ordentrabajotransitioninput-properties-fechapromesa.md "undefined#/properties/fechaPromesa")

### fechaPromesa Type

`string`

## items



`items`

* is optional

* Type: `object[]` ([OrdenTrabajoItem](ordentrabajoitem.md))

* cannot be null

* defined in: [OrdenTrabajoTransitionInput](ordentrabajotransitioninput-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([OrdenTrabajoItem](ordentrabajoitem.md))

## observaciones



`observaciones`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenTrabajoTransitionInput](ordentrabajotransitioninput-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

## tecnicoId



`tecnicoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenTrabajoTransitionInput](ordentrabajotransitioninput-properties-tecnicoid.md "undefined#/properties/tecnicoId")

### tecnicoId Type

`integer`

## trabajoRealizado



`trabajoRealizado`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenTrabajoTransitionInput](ordentrabajotransitioninput-properties-trabajorealizado.md "undefined#/properties/trabajoRealizado")

### trabajoRealizado Type

`string`
