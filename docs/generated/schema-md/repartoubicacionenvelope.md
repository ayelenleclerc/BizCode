# RepartoUbicacionEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoUbicacionEnvelope.schema.json](../schema-json/RepartoUbicacionEnvelope.schema.json "open original schema") |

## RepartoUbicacionEnvelope Type

`object` ([RepartoUbicacionEnvelope](repartoubicacionenvelope.md))

# RepartoUbicacionEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [RepartoUbicacionEnvelope](repartoubicacion.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [RepartoUbicacionEnvelope](repartoubicacionenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([RepartoUbicacion](repartoubicacion.md))

* cannot be null

* defined in: [RepartoUbicacionEnvelope](repartoubicacion.md "undefined#/properties/data")

### data Type

`object` ([RepartoUbicacion](repartoubicacion.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RepartoUbicacionEnvelope](repartoubicacionenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
