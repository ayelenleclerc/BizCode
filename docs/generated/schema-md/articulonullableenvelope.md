# ArticuloNullableEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ArticuloNullableEnvelope.schema.json](../schema-json/ArticuloNullableEnvelope.schema.json "open original schema") |

## ArticuloNullableEnvelope Type

`object` ([ArticuloNullableEnvelope](articulonullableenvelope.md))

# ArticuloNullableEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [data](#data)       | Merged    | Required | cannot be null | [ArticuloNullableEnvelope](articulonullableenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [ArticuloNullableEnvelope](articulonullableenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: merged type ([Details](articulonullableenvelope-properties-data.md))

* cannot be null

* defined in: [ArticuloNullableEnvelope](articulonullableenvelope-properties-data.md "undefined#/properties/data")

### data Type

merged type ([Details](articulonullableenvelope-properties-data.md))

any of

* [Articulo](articulo.md "check type definition")

* [Untitled null in ArticuloNullableEnvelope](articulonullableenvelope-properties-data-anyof-1.md "check type definition")

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ArticuloNullableEnvelope](articulonullableenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
