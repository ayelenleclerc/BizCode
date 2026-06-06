# ProveedorHistorialEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorHistorialEnvelope.schema.json](../schema-json/ProveedorHistorialEnvelope.schema.json "open original schema") |

## ProveedorHistorialEnvelope Type

`object` ([ProveedorHistorialEnvelope](proveedorhistorialenvelope.md))

# ProveedorHistorialEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ProveedorHistorialEnvelope](proveedorhistorialresumen.md "undefined#/properties/data")                        |
| [success](#success) | `boolean` | Required | cannot be null | [ProveedorHistorialEnvelope](proveedorhistorialenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ProveedorHistorialResumen](proveedorhistorialresumen.md))

* cannot be null

* defined in: [ProveedorHistorialEnvelope](proveedorhistorialresumen.md "undefined#/properties/data")

### data Type

`object` ([ProveedorHistorialResumen](proveedorhistorialresumen.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ProveedorHistorialEnvelope](proveedorhistorialenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
