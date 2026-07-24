# BulkImportValidateSummary Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [BulkImportValidateSummary.schema.json](../schema-json/BulkImportValidateSummary.schema.json "open original schema") |

## BulkImportValidateSummary Type

`object` ([BulkImportValidateSummary](bulkimportvalidatesummary.md))

# BulkImportValidateSummary Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                                                 |
| :-------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [duplicateCount](#duplicatecount) | `integer` | Required | cannot be null | [BulkImportValidateSummary](bulkimportvalidatesummary-properties-duplicatecount.md "undefined#/properties/duplicateCount") |
| [entity](#entity)                 | `string`  | Required | cannot be null | [BulkImportValidateSummary](bulkimportvalidatesummary-properties-entity.md "undefined#/properties/entity")                 |
| [errorCount](#errorcount)         | `integer` | Required | cannot be null | [BulkImportValidateSummary](bulkimportvalidatesummary-properties-errorcount.md "undefined#/properties/errorCount")         |
| [issues](#issues)                 | `array`   | Required | cannot be null | [BulkImportValidateSummary](bulkimportvalidatesummary-properties-issues.md "undefined#/properties/issues")                 |
| [okCount](#okcount)               | `integer` | Required | cannot be null | [BulkImportValidateSummary](bulkimportvalidatesummary-properties-okcount.md "undefined#/properties/okCount")               |
| [totalRows](#totalrows)           | `integer` | Required | cannot be null | [BulkImportValidateSummary](bulkimportvalidatesummary-properties-totalrows.md "undefined#/properties/totalRows")           |

## duplicateCount



`duplicateCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [BulkImportValidateSummary](bulkimportvalidatesummary-properties-duplicatecount.md "undefined#/properties/duplicateCount")

### duplicateCount Type

`integer`

## entity



`entity`

* is required

* Type: `string`

* cannot be null

* defined in: [BulkImportValidateSummary](bulkimportvalidatesummary-properties-entity.md "undefined#/properties/entity")

### entity Type

`string`

### entity Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"articulos"`   |             |
| `"clientes"`    |             |
| `"proveedores"` |             |
| `"saldos"`      |             |

## errorCount



`errorCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [BulkImportValidateSummary](bulkimportvalidatesummary-properties-errorcount.md "undefined#/properties/errorCount")

### errorCount Type

`integer`

## issues



`issues`

* is required

* Type: `object[]` ([Details](bulkimportvalidatesummary-properties-issues-items.md))

* cannot be null

* defined in: [BulkImportValidateSummary](bulkimportvalidatesummary-properties-issues.md "undefined#/properties/issues")

### issues Type

`object[]` ([Details](bulkimportvalidatesummary-properties-issues-items.md))

## okCount



`okCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [BulkImportValidateSummary](bulkimportvalidatesummary-properties-okcount.md "undefined#/properties/okCount")

### okCount Type

`integer`

## totalRows



`totalRows`

* is required

* Type: `integer`

* cannot be null

* defined in: [BulkImportValidateSummary](bulkimportvalidatesummary-properties-totalrows.md "undefined#/properties/totalRows")

### totalRows Type

`integer`
