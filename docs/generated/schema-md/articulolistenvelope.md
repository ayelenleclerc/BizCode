# ArticuloListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ArticuloListEnvelope.schema.json](../schema-json/ArticuloListEnvelope.schema.json "open original schema") |

## ArticuloListEnvelope Type

`object` ([ArticuloListEnvelope](articulolistenvelope.md))

# ArticuloListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [ArticuloListEnvelope](articulolistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [ArticuloListEnvelope](articulolistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([Articulo](articulo.md))

* cannot be null

* defined in: [ArticuloListEnvelope](articulolistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([Articulo](articulo.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ArticuloListEnvelope](articulolistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
