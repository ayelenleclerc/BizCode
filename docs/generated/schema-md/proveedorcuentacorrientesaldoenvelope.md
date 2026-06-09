# ProveedorCuentaCorrienteSaldoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorCuentaCorrienteSaldoEnvelope.schema.json](../schema-json/ProveedorCuentaCorrienteSaldoEnvelope.schema.json "open original schema") |

## ProveedorCuentaCorrienteSaldoEnvelope Type

`object` ([ProveedorCuentaCorrienteSaldoEnvelope](proveedorcuentacorrientesaldoenvelope.md))

# ProveedorCuentaCorrienteSaldoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ProveedorCuentaCorrienteSaldoEnvelope](proveedorcuentacorrientesaldo.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ProveedorCuentaCorrienteSaldoEnvelope](proveedorcuentacorrientesaldoenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ProveedorCuentaCorrienteSaldo](proveedorcuentacorrientesaldo.md))

* cannot be null

* defined in: [ProveedorCuentaCorrienteSaldoEnvelope](proveedorcuentacorrientesaldo.md "undefined#/properties/data")

### data Type

`object` ([ProveedorCuentaCorrienteSaldo](proveedorcuentacorrientesaldo.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ProveedorCuentaCorrienteSaldoEnvelope](proveedorcuentacorrientesaldoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
