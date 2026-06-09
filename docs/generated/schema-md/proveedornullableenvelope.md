# ProveedorNullableEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorNullableEnvelope.schema.json](../schema-json/ProveedorNullableEnvelope.schema.json "open original schema") |

## ProveedorNullableEnvelope Type

`object` ([ProveedorNullableEnvelope](proveedornullableenvelope.md))

# ProveedorNullableEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [data](#data)       | Merged    | Required | cannot be null | [ProveedorNullableEnvelope](proveedornullableenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [ProveedorNullableEnvelope](proveedornullableenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: merged type ([Details](proveedornullableenvelope-properties-data.md))

* cannot be null

* defined in: [ProveedorNullableEnvelope](proveedornullableenvelope-properties-data.md "undefined#/properties/data")

### data Type

merged type ([Details](proveedornullableenvelope-properties-data.md))

any of

* [Proveedor](proveedor.md "check type definition")

* [Untitled null in ProveedorNullableEnvelope](proveedornullableenvelope-properties-data-anyof-1.md "check type definition")

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ProveedorNullableEnvelope](proveedornullableenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
