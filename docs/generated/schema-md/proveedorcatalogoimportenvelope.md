# ProveedorCatalogoImportEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorCatalogoImportEnvelope.schema.json](../schema-json/ProveedorCatalogoImportEnvelope.schema.json "open original schema") |

## ProveedorCatalogoImportEnvelope Type

`object` ([ProveedorCatalogoImportEnvelope](proveedorcatalogoimportenvelope.md))

# ProveedorCatalogoImportEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ProveedorCatalogoImportEnvelope](proveedorcatalogoimportdata.md "undefined#/properties/data")                           |
| [success](#success) | `boolean` | Required | cannot be null | [ProveedorCatalogoImportEnvelope](proveedorcatalogoimportenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ProveedorCatalogoImportData](proveedorcatalogoimportdata.md))

* cannot be null

* defined in: [ProveedorCatalogoImportEnvelope](proveedorcatalogoimportdata.md "undefined#/properties/data")

### data Type

`object` ([ProveedorCatalogoImportData](proveedorcatalogoimportdata.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ProveedorCatalogoImportEnvelope](proveedorcatalogoimportenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
