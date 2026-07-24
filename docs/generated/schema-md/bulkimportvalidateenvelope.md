# BulkImportValidateEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [BulkImportValidateEnvelope.schema.json](../schema-json/BulkImportValidateEnvelope.schema.json "open original schema") |

## BulkImportValidateEnvelope Type

`object` ([BulkImportValidateEnvelope](bulkimportvalidateenvelope.md))

# BulkImportValidateEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [BulkImportValidateEnvelope](bulkimportvalidatesummary.md "undefined#/properties/data")                        |
| [success](#success) | `boolean` | Required | cannot be null | [BulkImportValidateEnvelope](bulkimportvalidateenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([BulkImportValidateSummary](bulkimportvalidatesummary.md))

* cannot be null

* defined in: [BulkImportValidateEnvelope](bulkimportvalidatesummary.md "undefined#/properties/data")

### data Type

`object` ([BulkImportValidateSummary](bulkimportvalidatesummary.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [BulkImportValidateEnvelope](bulkimportvalidateenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `true` |             |
