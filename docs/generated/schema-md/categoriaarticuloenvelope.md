# CategoriaArticuloEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CategoriaArticuloEnvelope.schema.json](../schema-json/CategoriaArticuloEnvelope.schema.json "open original schema") |

## CategoriaArticuloEnvelope Type

`object` ([CategoriaArticuloEnvelope](categoriaarticuloenvelope.md))

# CategoriaArticuloEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [CategoriaArticuloEnvelope](categoriaarticulo.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [CategoriaArticuloEnvelope](categoriaarticuloenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([CategoriaArticulo](categoriaarticulo.md))

* cannot be null

* defined in: [CategoriaArticuloEnvelope](categoriaarticulo.md "undefined#/properties/data")

### data Type

`object` ([CategoriaArticulo](categoriaarticulo.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [CategoriaArticuloEnvelope](categoriaarticuloenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
