# ProveedorCatalogoListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorCatalogoListEnvelope.schema.json](../schema-json/ProveedorCatalogoListEnvelope.schema.json "open original schema") |

## ProveedorCatalogoListEnvelope Type

`object` ([ProveedorCatalogoListEnvelope](proveedorcatalogolistenvelope.md))

# ProveedorCatalogoListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ProveedorCatalogoListEnvelope](proveedorcatalogolistdata.md "undefined#/properties/data")                           |
| [success](#success) | `boolean` | Required | cannot be null | [ProveedorCatalogoListEnvelope](proveedorcatalogolistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ProveedorCatalogoListData](proveedorcatalogolistdata.md))

* cannot be null

* defined in: [ProveedorCatalogoListEnvelope](proveedorcatalogolistdata.md "undefined#/properties/data")

### data Type

`object` ([ProveedorCatalogoListData](proveedorcatalogolistdata.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ProveedorCatalogoListEnvelope](proveedorcatalogolistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
