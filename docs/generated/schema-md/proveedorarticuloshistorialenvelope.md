# ProveedorArticulosHistorialEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorArticulosHistorialEnvelope.schema.json](../schema-json/ProveedorArticulosHistorialEnvelope.schema.json "open original schema") |

## ProveedorArticulosHistorialEnvelope Type

`object` ([ProveedorArticulosHistorialEnvelope](proveedorarticuloshistorialenvelope.md))

# ProveedorArticulosHistorialEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ProveedorArticulosHistorialEnvelope](proveedorarticuloshistorialdata.md "undefined#/properties/data")                           |
| [success](#success) | `boolean` | Required | cannot be null | [ProveedorArticulosHistorialEnvelope](proveedorarticuloshistorialenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ProveedorArticulosHistorialData](proveedorarticuloshistorialdata.md))

* cannot be null

* defined in: [ProveedorArticulosHistorialEnvelope](proveedorarticuloshistorialdata.md "undefined#/properties/data")

### data Type

`object` ([ProveedorArticulosHistorialData](proveedorarticuloshistorialdata.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ProveedorArticulosHistorialEnvelope](proveedorarticuloshistorialenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
