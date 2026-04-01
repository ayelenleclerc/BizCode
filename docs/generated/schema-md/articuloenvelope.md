# ArticuloEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ArticuloEnvelope.schema.json](../schema-json/ArticuloEnvelope.schema.json "open original schema") |

## ArticuloEnvelope Type

`object` ([ArticuloEnvelope](articuloenvelope.md))

# ArticuloEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ArticuloEnvelope](articulo.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ArticuloEnvelope](articuloenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Articulo](articulo.md))

* cannot be null

* defined in: [ArticuloEnvelope](articulo.md "undefined#/properties/data")

### data Type

`object` ([Articulo](articulo.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ArticuloEnvelope](articuloenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
