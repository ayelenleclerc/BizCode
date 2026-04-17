# ProveedorEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorEnvelope.schema.json](../schema-json/ProveedorEnvelope.schema.json "open original schema") |

## ProveedorEnvelope Type

`object` ([ProveedorEnvelope](proveedorenvelope.md))

# ProveedorEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ProveedorEnvelope](proveedor.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ProveedorEnvelope](proveedorenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Proveedor](proveedor.md))

* cannot be null

* defined in: [ProveedorEnvelope](proveedor.md "undefined#/properties/data")

### data Type

`object` ([Proveedor](proveedor.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ProveedorEnvelope](proveedorenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
