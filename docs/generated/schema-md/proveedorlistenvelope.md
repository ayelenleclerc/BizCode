# ProveedorListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorListEnvelope.schema.json](../schema-json/ProveedorListEnvelope.schema.json "open original schema") |

## ProveedorListEnvelope Type

`object` ([ProveedorListEnvelope](proveedorlistenvelope.md))

# ProveedorListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [ProveedorListEnvelope](proveedorlistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [ProveedorListEnvelope](proveedorlistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([Proveedor](proveedor.md))

* cannot be null

* defined in: [ProveedorListEnvelope](proveedorlistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([Proveedor](proveedor.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ProveedorListEnvelope](proveedorlistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
