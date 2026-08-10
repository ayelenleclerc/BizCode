# RutaEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RutaEnvelope.schema.json](../schema-json/RutaEnvelope.schema.json "open original schema") |

## RutaEnvelope Type

`object` ([RutaEnvelope](rutaenvelope.md))

# RutaEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                         |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [RutaEnvelope](ruta.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [RutaEnvelope](rutaenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Ruta](ruta.md))

* cannot be null

* defined in: [RutaEnvelope](ruta.md "undefined#/properties/data")

### data Type

`object` ([Ruta](ruta.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RutaEnvelope](rutaenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
