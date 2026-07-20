# OrdenTrabajo Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenTrabajoListEnvelope.schema.json\*](../schema-json/OrdenTrabajoListEnvelope.schema.json "open original schema") |

## items Type

`object` ([OrdenTrabajo](ordentrabajo.md))

# items Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                             |
| :-------------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid)                 | `integer` | Optional | cannot be null | [OrdenTrabajo](ordentrabajo-properties-clienteid.md "undefined#/properties/clienteId")                 |
| [enGarantia](#engarantia)               | `boolean` | Optional | cannot be null | [OrdenTrabajo](ordentrabajo-properties-engarantia.md "undefined#/properties/enGarantia")               |
| [equipoDescripcion](#equipodescripcion) | `string`  | Optional | cannot be null | [OrdenTrabajo](ordentrabajo-properties-equipodescripcion.md "undefined#/properties/equipoDescripcion") |
| [estado](#estado)                       | `string`  | Optional | cannot be null | [OrdenTrabajo](ordentrabajoestado.md "undefined#/properties/estado")                                   |
| [facturaId](#facturaid)                 | `integer` | Optional | cannot be null | [OrdenTrabajo](ordentrabajo-properties-facturaid.md "undefined#/properties/facturaId")                 |
| [id](#id)                               | `integer` | Optional | cannot be null | [OrdenTrabajo](ordentrabajo-properties-id.md "undefined#/properties/id")                               |
| [items](#items)                         | `array`   | Optional | cannot be null | [OrdenTrabajo](ordentrabajo-properties-items.md "undefined#/properties/items")                         |
| [numero](#numero)                       | `integer` | Optional | cannot be null | [OrdenTrabajo](ordentrabajo-properties-numero.md "undefined#/properties/numero")                       |
| [presupuesto](#presupuesto)             | `number`  | Optional | cannot be null | [OrdenTrabajo](ordentrabajo-properties-presupuesto.md "undefined#/properties/presupuesto")             |
| [prioridad](#prioridad)                 | `string`  | Optional | cannot be null | [OrdenTrabajo](ordentrabajoprioridad.md "undefined#/properties/prioridad")                             |
| [sintomaReportado](#sintomareportado)   | `string`  | Optional | cannot be null | [OrdenTrabajo](ordentrabajo-properties-sintomareportado.md "undefined#/properties/sintomaReportado")   |
| [tecnicoId](#tecnicoid)                 | `integer` | Optional | cannot be null | [OrdenTrabajo](ordentrabajo-properties-tecnicoid.md "undefined#/properties/tecnicoId")                 |
| Additional Properties                   | Any       | Optional | can be null    |                                                                                                        |

## clienteId



`clienteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenTrabajo](ordentrabajo-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## enGarantia



`enGarantia`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [OrdenTrabajo](ordentrabajo-properties-engarantia.md "undefined#/properties/enGarantia")

### enGarantia Type

`boolean`

## equipoDescripcion



`equipoDescripcion`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenTrabajo](ordentrabajo-properties-equipodescripcion.md "undefined#/properties/equipoDescripcion")

### equipoDescripcion Type

`string`

## estado



`estado`

* is optional

* Type: `string` ([OrdenTrabajoEstado](ordentrabajoestado.md))

* cannot be null

* defined in: [OrdenTrabajo](ordentrabajoestado.md "undefined#/properties/estado")

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

## facturaId



`facturaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenTrabajo](ordentrabajo-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenTrabajo](ordentrabajo-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## items



`items`

* is optional

* Type: `object[]` ([OrdenTrabajoItem](ordentrabajoitem.md))

* cannot be null

* defined in: [OrdenTrabajo](ordentrabajo-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([OrdenTrabajoItem](ordentrabajoitem.md))

## numero



`numero`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenTrabajo](ordentrabajo-properties-numero.md "undefined#/properties/numero")

### numero Type

`integer`

## presupuesto



`presupuesto`

* is optional

* Type: `number`

* cannot be null

* defined in: [OrdenTrabajo](ordentrabajo-properties-presupuesto.md "undefined#/properties/presupuesto")

### presupuesto Type

`number`

## prioridad



`prioridad`

* is optional

* Type: `string` ([OrdenTrabajoPrioridad](ordentrabajoprioridad.md))

* cannot be null

* defined in: [OrdenTrabajo](ordentrabajoprioridad.md "undefined#/properties/prioridad")

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

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenTrabajo](ordentrabajo-properties-sintomareportado.md "undefined#/properties/sintomaReportado")

### sintomaReportado Type

`string`

## tecnicoId



`tecnicoId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [OrdenTrabajo](ordentrabajo-properties-tecnicoid.md "undefined#/properties/tecnicoId")

### tecnicoId Type

`integer`

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
