# Untitled object in OrdenTrabajoFacturarEnvelope Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenTrabajoFacturarEnvelope.schema.json\*](../schema-json/OrdenTrabajoFacturarEnvelope.schema.json "open original schema") |

## data Type

`object` ([Details](ordentrabajofacturarenvelope-properties-data.md))

# data Properties

| Property                | Type      | Required | Nullable       | Defined by                                                                                                                                             |
| :---------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [facturaId](#facturaid) | `integer` | Required | cannot be null | [OrdenTrabajoFacturarEnvelope](ordentrabajofacturarenvelope-properties-data-properties-facturaid.md "undefined#/properties/data/properties/facturaId") |
| [orden](#orden)         | `object`  | Required | cannot be null | [OrdenTrabajoFacturarEnvelope](ordentrabajo.md "undefined#/properties/data/properties/orden")                                                          |

## facturaId



`facturaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenTrabajoFacturarEnvelope](ordentrabajofacturarenvelope-properties-data-properties-facturaid.md "undefined#/properties/data/properties/facturaId")

### facturaId Type

`integer`

## orden



`orden`

* is required

* Type: `object` ([OrdenTrabajo](ordentrabajo.md))

* cannot be null

* defined in: [OrdenTrabajoFacturarEnvelope](ordentrabajo.md "undefined#/properties/data/properties/orden")

### orden Type

`object` ([OrdenTrabajo](ordentrabajo.md))
