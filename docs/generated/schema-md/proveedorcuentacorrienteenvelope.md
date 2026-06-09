# ProveedorCuentaCorrienteEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorCuentaCorrienteEnvelope.schema.json](../schema-json/ProveedorCuentaCorrienteEnvelope.schema.json "open original schema") |

## ProveedorCuentaCorrienteEnvelope Type

`object` ([ProveedorCuentaCorrienteEnvelope](proveedorcuentacorrienteenvelope.md))

# ProveedorCuentaCorrienteEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ProveedorCuentaCorrienteEnvelope](proveedorcuentacorriente.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ProveedorCuentaCorrienteEnvelope](proveedorcuentacorrienteenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ProveedorCuentaCorriente](proveedorcuentacorriente.md))

* cannot be null

* defined in: [ProveedorCuentaCorrienteEnvelope](proveedorcuentacorriente.md "undefined#/properties/data")

### data Type

`object` ([ProveedorCuentaCorriente](proveedorcuentacorriente.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ProveedorCuentaCorrienteEnvelope](proveedorcuentacorrienteenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
