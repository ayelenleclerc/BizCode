# BancoImportResult Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [BancoImportResult.schema.json](../schema-json/BancoImportResult.schema.json "open original schema") |

## BancoImportResult Type

`object` ([BancoImportResult](bancoimportresult.md))

# BancoImportResult Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                                       |
| :-------------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [errors](#errors)                       | `array`   | Required | cannot be null | [BancoImportResult](bancoimportresult-properties-errors.md "undefined#/properties/errors")                       |
| [format](#format)                       | `string`  | Required | cannot be null | [BancoImportResult](bancoimportresult-properties-format.md "undefined#/properties/format")                       |
| [imported](#imported)                   | `integer` | Required | cannot be null | [BancoImportResult](bancoimportresult-properties-imported.md "undefined#/properties/imported")                   |
| [skippedDuplicates](#skippedduplicates) | `integer` | Required | cannot be null | [BancoImportResult](bancoimportresult-properties-skippedduplicates.md "undefined#/properties/skippedDuplicates") |

## errors



`errors`

* is required

* Type: `object[]` ([Details](bancoimportresult-properties-errors-items.md))

* cannot be null

* defined in: [BancoImportResult](bancoimportresult-properties-errors.md "undefined#/properties/errors")

### errors Type

`object[]` ([Details](bancoimportresult-properties-errors-items.md))

## format



`format`

* is required

* Type: `string`

* cannot be null

* defined in: [BancoImportResult](bancoimportresult-properties-format.md "undefined#/properties/format")

### format Type

`string`

## imported



`imported`

* is required

* Type: `integer`

* cannot be null

* defined in: [BancoImportResult](bancoimportresult-properties-imported.md "undefined#/properties/imported")

### imported Type

`integer`

## skippedDuplicates



`skippedDuplicates`

* is required

* Type: `integer`

* cannot be null

* defined in: [BancoImportResult](bancoimportresult-properties-skippedduplicates.md "undefined#/properties/skippedDuplicates")

### skippedDuplicates Type

`integer`
