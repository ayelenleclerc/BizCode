# Untitled object in OrdenTrabajoUpdateInput Schema

```txt
undefined#/allOf/1
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenTrabajoUpdateInput.schema.json\*](../schema-json/OrdenTrabajoUpdateInput.schema.json "open original schema") |

## 1 Type

`object` ([Details](ordentrabajoupdateinput-allof-1.md))

# 1 Properties

| Property                      | Type     | Required | Nullable       | Defined by                                                                                                                         |
| :---------------------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| [estado](#estado)             | `string` | Optional | cannot be null | [OrdenTrabajoUpdateInput](ordentrabajoestado.md "undefined#/allOf/1/properties/estado")                                            |
| [fechaEntrega](#fechaentrega) | `string` | Optional | cannot be null | [OrdenTrabajoUpdateInput](ordentrabajoupdateinput-allof-1-properties-fechaentrega.md "undefined#/allOf/1/properties/fechaEntrega") |
| [presupuesto](#presupuesto)   | `number` | Optional | cannot be null | [OrdenTrabajoUpdateInput](ordentrabajoupdateinput-allof-1-properties-presupuesto.md "undefined#/allOf/1/properties/presupuesto")   |

## estado



`estado`

* is optional

* Type: `string` ([OrdenTrabajoEstado](ordentrabajoestado.md))

* cannot be null

* defined in: [OrdenTrabajoUpdateInput](ordentrabajoestado.md "undefined#/allOf/1/properties/estado")

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

* defined in: [OrdenTrabajoUpdateInput](ordentrabajoupdateinput-allof-1-properties-fechaentrega.md "undefined#/allOf/1/properties/fechaEntrega")

### fechaEntrega Type

`string`

## presupuesto



`presupuesto`

* is optional

* Type: `number`

* cannot be null

* defined in: [OrdenTrabajoUpdateInput](ordentrabajoupdateinput-allof-1-properties-presupuesto.md "undefined#/allOf/1/properties/presupuesto")

### presupuesto Type

`number`
