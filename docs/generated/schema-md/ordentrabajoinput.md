# OrdenTrabajoInput Schema

```txt
undefined#/allOf/0
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenTrabajoUpdateInput.schema.json\*](../schema-json/OrdenTrabajoUpdateInput.schema.json "open original schema") |

## 0 Type

`object` ([OrdenTrabajoInput](ordentrabajoinput.md))

# 0 Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                                       |
| :-------------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid)                 | `integer` | Required | cannot be null | [OrdenTrabajoInput](ordentrabajoinput-properties-clienteid.md "undefined#/properties/clienteId")                 |
| [diagnostico](#diagnostico)             | `string`  | Optional | cannot be null | [OrdenTrabajoInput](ordentrabajoinput-properties-diagnostico.md "undefined#/properties/diagnostico")             |
| [enGarantia](#engarantia)               | `boolean` | Optional | cannot be null | [OrdenTrabajoInput](ordentrabajoinput-properties-engarantia.md "undefined#/properties/enGarantia")               |
| [equipoDescripcion](#equipodescripcion) | `string`  | Required | cannot be null | [OrdenTrabajoInput](ordentrabajoinput-properties-equipodescripcion.md "undefined#/properties/equipoDescripcion") |
| [equipoMarca](#equipomarca)             | `string`  | Optional | cannot be null | [OrdenTrabajoInput](ordentrabajoinput-properties-equipomarca.md "undefined#/properties/equipoMarca")             |
| [equipoModelo](#equipomodelo)           | `string`  | Optional | cannot be null | [OrdenTrabajoInput](ordentrabajoinput-properties-equipomodelo.md "undefined#/properties/equipoModelo")           |
| [equipoNroSerie](#equiponroserie)       | `string`  | Optional | cannot be null | [OrdenTrabajoInput](ordentrabajoinput-properties-equiponroserie.md "undefined#/properties/equipoNroSerie")       |
| [fechaPromesa](#fechapromesa)           | `string`  | Optional | cannot be null | [OrdenTrabajoInput](ordentrabajoinput-properties-fechapromesa.md "undefined#/properties/fechaPromesa")           |
| [garantiaVence](#garantiavence)         | `string`  | Optional | cannot be null | [OrdenTrabajoInput](ordentrabajoinput-properties-garantiavence.md "undefined#/properties/garantiaVence")         |
| [items](#items)                         | `array`   | Optional | cannot be null | [OrdenTrabajoInput](ordentrabajoinput-properties-items.md "undefined#/properties/items")                         |
| [observaciones](#observaciones)         | `string`  | Optional | cannot be null | [OrdenTrabajoInput](ordentrabajoinput-properties-observaciones.md "undefined#/properties/observaciones")         |
| [otGarantiaId](#otgarantiaid)           | `integer` | Optional | cannot be null | [OrdenTrabajoInput](ordentrabajoinput-properties-otgarantiaid.md "undefined#/properties/otGarantiaId")           |
| [prioridad](#prioridad)                 | `string`  | Optional | cannot be null | [OrdenTrabajoInput](ordentrabajoprioridad.md "undefined#/properties/prioridad")                                  |
| [sintomaReportado](#sintomareportado)   | `string`  | Required | cannot be null | [OrdenTrabajoInput](ordentrabajoinput-properties-sintomareportado.md "undefined#/properties/sintomaReportado")   |
| [tecnicoId](#tecnicoid)                 | `integer` | Optional | cannot be null | [OrdenTrabajoInput](ordentrabajoinput-properties-tecnicoid.md "undefined#/properties/tecnicoId")                 |
| [trabajoRealizado](#trabajorealizado)   | `string`  | Optional | cannot be null | [OrdenTrabajoInput](ordentrabajoinput-properties-trabajorealizado.md "undefined#/properties/trabajoRealizado")   |

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenTrabajoInput](ordentrabajoinput-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

### clienteId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## diagnostico



`diagnostico`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenTrabajoInput](ordentrabajoinput-properties-diagnostico.md "undefined#/properties/diagnostico")

### diagnostico Type

`string`

## enGarantia



`enGarantia`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [OrdenTrabajoInput](ordentrabajoinput-properties-engarantia.md "undefined#/properties/enGarantia")

### enGarantia Type

`boolean`

## equipoDescripcion



`equipoDescripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [OrdenTrabajoInput](ordentrabajoinput-properties-equipodescripcion.md "undefined#/properties/equipoDescripcion")

### equipoDescripcion Type

`string`

### equipoDescripcion Constraints

**maximum length**: the maximum number of characters for this string is: `200`

**minimum length**: the minimum number of characters for this string is: `1`

## equipoMarca



`equipoMarca`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenTrabajoInput](ordentrabajoinput-properties-equipomarca.md "undefined#/properties/equipoMarca")

### equipoMarca Type

`string`

## equipoModelo



`equipoModelo`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenTrabajoInput](ordentrabajoinput-properties-equipomodelo.md "undefined#/properties/equipoModelo")

### equipoModelo Type

`string`

## equipoNroSerie



`equipoNroSerie`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenTrabajoInput](ordentrabajoinput-properties-equiponroserie.md "undefined#/properties/equipoNroSerie")

### equipoNroSerie Type

`string`

## fechaPromesa



`fechaPromesa`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenTrabajoInput](ordentrabajoinput-properties-fechapromesa.md "undefined#/properties/fechaPromesa")

### fechaPromesa Type

`string`

## garantiaVence



`garantiaVence`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenTrabajoInput](ordentrabajoinput-properties-garantiavence.md "undefined#/properties/garantiaVence")

### garantiaVence Type

`string`

## items



`items`

* is optional

* Type: `object[]` ([OrdenTrabajoItem](ordentrabajoitem.md))

* cannot be null

* defined in: [OrdenTrabajoInput](ordentrabajoinput-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([OrdenTrabajoItem](ordentrabajoitem.md))

## observaciones



`observaciones`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenTrabajoInput](ordentrabajoinput-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

## otGarantiaId



`otGarantiaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenTrabajoInput](ordentrabajoinput-properties-otgarantiaid.md "undefined#/properties/otGarantiaId")

### otGarantiaId Type

`integer`

## prioridad



`prioridad`

* is optional

* Type: `string` ([OrdenTrabajoPrioridad](ordentrabajoprioridad.md))

* cannot be null

* defined in: [OrdenTrabajoInput](ordentrabajoprioridad.md "undefined#/properties/prioridad")

### prioridad Type

`string` ([OrdenTrabajoPrioridad](ordentrabajoprioridad.md))

### prioridad Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"baja"`    |             |
| `"normal"`  |             |
| `"alta"`    |             |
| `"urgente"` |             |

## sintomaReportado



`sintomaReportado`

* is required

* Type: `string`

* cannot be null

* defined in: [OrdenTrabajoInput](ordentrabajoinput-properties-sintomareportado.md "undefined#/properties/sintomaReportado")

### sintomaReportado Type

`string`

### sintomaReportado Constraints

**maximum length**: the maximum number of characters for this string is: `500`

**minimum length**: the minimum number of characters for this string is: `1`

## tecnicoId



`tecnicoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenTrabajoInput](ordentrabajoinput-properties-tecnicoid.md "undefined#/properties/tecnicoId")

### tecnicoId Type

`integer`

## trabajoRealizado



`trabajoRealizado`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenTrabajoInput](ordentrabajoinput-properties-trabajorealizado.md "undefined#/properties/trabajoRealizado")

### trabajoRealizado Type

`string`
