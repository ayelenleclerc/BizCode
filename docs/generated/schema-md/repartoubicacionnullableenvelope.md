# RepartoUbicacionNullableEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoUbicacionNullableEnvelope.schema.json](../schema-json/RepartoUbicacionNullableEnvelope.schema.json "open original schema") |

## RepartoUbicacionNullableEnvelope Type

`object` ([RepartoUbicacionNullableEnvelope](repartoubicacionnullableenvelope.md))

# RepartoUbicacionNullableEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | Merged    | Required | cannot be null | [RepartoUbicacionNullableEnvelope](repartoubicacionnullableenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [RepartoUbicacionNullableEnvelope](repartoubicacionnullableenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: merged type ([Details](repartoubicacionnullableenvelope-properties-data.md))

* cannot be null

* defined in: [RepartoUbicacionNullableEnvelope](repartoubicacionnullableenvelope-properties-data.md "undefined#/properties/data")

### data Type

merged type ([Details](repartoubicacionnullableenvelope-properties-data.md))

one (and only one) of

* [RepartoUbicacion](repartoubicacion.md "check type definition")

* [Untitled null in RepartoUbicacionNullableEnvelope](repartoubicacionnullableenvelope-properties-data-oneof-1.md "check type definition")

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RepartoUbicacionNullableEnvelope](repartoubicacionnullableenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
