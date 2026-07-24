# Untitled object in BulkImportValidateSummary Schema

```txt
undefined#/properties/issues/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [BulkImportValidateSummary.schema.json\*](../schema-json/BulkImportValidateSummary.schema.json "open original schema") |

## items Type

`object` ([Details](bulkimportvalidatesummary-properties-issues-items.md))

# items Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [code](#code)       | `string`  | Required | cannot be null | [BulkImportValidateSummary](bulkimportvalidatesummary-properties-issues-items-properties-code.md "undefined#/properties/issues/items/properties/code")       |
| [kind](#kind)       | `string`  | Required | cannot be null | [BulkImportValidateSummary](bulkimportvalidatesummary-properties-issues-items-properties-kind.md "undefined#/properties/issues/items/properties/kind")       |
| [message](#message) | `string`  | Required | cannot be null | [BulkImportValidateSummary](bulkimportvalidatesummary-properties-issues-items-properties-message.md "undefined#/properties/issues/items/properties/message") |
| [row](#row)         | `integer` | Required | cannot be null | [BulkImportValidateSummary](bulkimportvalidatesummary-properties-issues-items-properties-row.md "undefined#/properties/issues/items/properties/row")         |

## code



`code`

* is required

* Type: `string`

* cannot be null

* defined in: [BulkImportValidateSummary](bulkimportvalidatesummary-properties-issues-items-properties-code.md "undefined#/properties/issues/items/properties/code")

### code Type

`string`

## kind



`kind`

* is required

* Type: `string`

* cannot be null

* defined in: [BulkImportValidateSummary](bulkimportvalidatesummary-properties-issues-items-properties-kind.md "undefined#/properties/issues/items/properties/kind")

### kind Type

`string`

### kind Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value         | Explanation |
| :------------ | :---------- |
| `"error"`     |             |
| `"duplicate"` |             |

## message



`message`

* is required

* Type: `string`

* cannot be null

* defined in: [BulkImportValidateSummary](bulkimportvalidatesummary-properties-issues-items-properties-message.md "undefined#/properties/issues/items/properties/message")

### message Type

`string`

## row



`row`

* is required

* Type: `integer`

* cannot be null

* defined in: [BulkImportValidateSummary](bulkimportvalidatesummary-properties-issues-items-properties-row.md "undefined#/properties/issues/items/properties/row")

### row Type

`integer`
