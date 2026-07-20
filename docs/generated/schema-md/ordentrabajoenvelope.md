# OrdenTrabajoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenTrabajoEnvelope.schema.json](../schema-json/OrdenTrabajoEnvelope.schema.json "open original schema") |

## OrdenTrabajoEnvelope Type

`object` ([OrdenTrabajoEnvelope](ordentrabajoenvelope.md))

# OrdenTrabajoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [OrdenTrabajoEnvelope](ordentrabajo.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [OrdenTrabajoEnvelope](ordentrabajoenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([OrdenTrabajo](ordentrabajo.md))

* cannot be null

* defined in: [OrdenTrabajoEnvelope](ordentrabajo.md "undefined#/properties/data")

### data Type

`object` ([OrdenTrabajo](ordentrabajo.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [OrdenTrabajoEnvelope](ordentrabajoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
