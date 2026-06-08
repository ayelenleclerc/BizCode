# ProveedorCatalogoImportData Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorCatalogoImportEnvelope.schema.json\*](../schema-json/ProveedorCatalogoImportEnvelope.schema.json "open original schema") |

## data Type

`object` ([ProveedorCatalogoImportData](proveedorcatalogoimportdata.md))

# data Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [created](#created) | `integer` | Required | cannot be null | [ProveedorCatalogoImportData](proveedorcatalogoimportdata-properties-created.md "undefined#/properties/created") |
| [errors](#errors)   | `array`   | Required | cannot be null | [ProveedorCatalogoImportData](proveedorcatalogoimportdata-properties-errors.md "undefined#/properties/errors")   |
| [skipped](#skipped) | `integer` | Required | cannot be null | [ProveedorCatalogoImportData](proveedorcatalogoimportdata-properties-skipped.md "undefined#/properties/skipped") |
| [updated](#updated) | `integer` | Required | cannot be null | [ProveedorCatalogoImportData](proveedorcatalogoimportdata-properties-updated.md "undefined#/properties/updated") |

## created



`created`

* is required

* Type: `integer`

* cannot be null

* defined in: [ProveedorCatalogoImportData](proveedorcatalogoimportdata-properties-created.md "undefined#/properties/created")

### created Type

`integer`

## errors



`errors`

* is required

* Type: `object[]` ([ProveedorCatalogoImportError](proveedorcatalogoimporterror.md))

* cannot be null

* defined in: [ProveedorCatalogoImportData](proveedorcatalogoimportdata-properties-errors.md "undefined#/properties/errors")

### errors Type

`object[]` ([ProveedorCatalogoImportError](proveedorcatalogoimporterror.md))

## skipped



`skipped`

* is required

* Type: `integer`

* cannot be null

* defined in: [ProveedorCatalogoImportData](proveedorcatalogoimportdata-properties-skipped.md "undefined#/properties/skipped")

### skipped Type

`integer`

## updated



`updated`

* is required

* Type: `integer`

* cannot be null

* defined in: [ProveedorCatalogoImportData](proveedorcatalogoimportdata-properties-updated.md "undefined#/properties/updated")

### updated Type

`integer`
