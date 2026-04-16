# ClienteImportResult Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ClienteImportResult.schema.json](../schema-json/ClienteImportResult.schema.json "open original schema") |

## ClienteImportResult Type

`object` ([ClienteImportResult](clienteimportresult.md))

# ClienteImportResult Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [created](#created) | `integer` | Required | cannot be null | [ClienteImportResult](clienteimportresult-properties-created.md "undefined#/properties/created") |
| [errors](#errors)   | `array`   | Required | cannot be null | [ClienteImportResult](clienteimportresult-properties-errors.md "undefined#/properties/errors")   |
| [skipped](#skipped) | `integer` | Required | cannot be null | [ClienteImportResult](clienteimportresult-properties-skipped.md "undefined#/properties/skipped") |

## created



`created`

* is required

* Type: `integer`

* cannot be null

* defined in: [ClienteImportResult](clienteimportresult-properties-created.md "undefined#/properties/created")

### created Type

`integer`

### created Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## errors



`errors`

* is required

* Type: `object[]` ([ClienteImportRowError](clienteimportrowerror.md))

* cannot be null

* defined in: [ClienteImportResult](clienteimportresult-properties-errors.md "undefined#/properties/errors")

### errors Type

`object[]` ([ClienteImportRowError](clienteimportrowerror.md))

## skipped



`skipped`

* is required

* Type: `integer`

* cannot be null

* defined in: [ClienteImportResult](clienteimportresult-properties-skipped.md "undefined#/properties/skipped")

### skipped Type

`integer`

### skipped Constraints

**minimum**: the value of this number must greater than or equal to: `0`
