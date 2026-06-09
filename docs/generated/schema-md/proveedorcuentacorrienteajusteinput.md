# ProveedorCuentaCorrienteAjusteInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorCuentaCorrienteAjusteInput.schema.json](../schema-json/ProveedorCuentaCorrienteAjusteInput.schema.json "open original schema") |

## ProveedorCuentaCorrienteAjusteInput Type

`object` ([ProveedorCuentaCorrienteAjusteInput](proveedorcuentacorrienteajusteinput.md))

# ProveedorCuentaCorrienteAjusteInput Properties

| Property          | Type     | Required | Nullable       | Defined by                                                                                                                     |
| :---------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| [monto](#monto)   | `number` | Required | cannot be null | [ProveedorCuentaCorrienteAjusteInput](proveedorcuentacorrienteajusteinput-properties-monto.md "undefined#/properties/monto")   |
| [motivo](#motivo) | `string` | Required | cannot be null | [ProveedorCuentaCorrienteAjusteInput](proveedorcuentacorrienteajusteinput-properties-motivo.md "undefined#/properties/motivo") |

## monto

Non-zero; positive increases debt, negative reduces debt

`monto`

* is required

* Type: `number`

* cannot be null

* defined in: [ProveedorCuentaCorrienteAjusteInput](proveedorcuentacorrienteajusteinput-properties-monto.md "undefined#/properties/monto")

### monto Type

`number`

## motivo



`motivo`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorCuentaCorrienteAjusteInput](proveedorcuentacorrienteajusteinput-properties-motivo.md "undefined#/properties/motivo")

### motivo Type

`string`

### motivo Constraints

**maximum length**: the maximum number of characters for this string is: `500`
