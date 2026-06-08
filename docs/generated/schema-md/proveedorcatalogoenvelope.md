# ProveedorCatalogoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorCatalogoEnvelope.schema.json](../schema-json/ProveedorCatalogoEnvelope.schema.json "open original schema") |

## ProveedorCatalogoEnvelope Type

`object` ([ProveedorCatalogoEnvelope](proveedorcatalogoenvelope.md))

# ProveedorCatalogoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ProveedorCatalogoEnvelope](proveedorcatalogorow.md "undefined#/properties/data")                            |
| [success](#success) | `boolean` | Required | cannot be null | [ProveedorCatalogoEnvelope](proveedorcatalogoenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ProveedorCatalogoRow](proveedorcatalogorow.md))

* cannot be null

* defined in: [ProveedorCatalogoEnvelope](proveedorcatalogorow.md "undefined#/properties/data")

### data Type

`object` ([ProveedorCatalogoRow](proveedorcatalogorow.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ProveedorCatalogoEnvelope](proveedorcatalogoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
