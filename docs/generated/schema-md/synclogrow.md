# SyncLogRow Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SyncLogRow.schema.json](../schema-json/SyncLogRow.schema.json "open original schema") |

## SyncLogRow Type

`object` ([SyncLogRow](synclogrow.md))

# SyncLogRow Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                 |
| :------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [connectorType](#connectortype) | `string`  | Required | cannot be null | [SyncLogRow](synclogrow-properties-connectortype.md "undefined#/properties/connectorType") |
| [createdAt](#createdat)         | `string`  | Required | cannot be null | [SyncLogRow](synclogrow-properties-createdat.md "undefined#/properties/createdAt")         |
| [errorMsg](#errormsg)           | `string`  | Optional | cannot be null | [SyncLogRow](synclogrow-properties-errormsg.md "undefined#/properties/errorMsg")           |
| [id](#id)                       | `integer` | Required | cannot be null | [SyncLogRow](synclogrow-properties-id.md "undefined#/properties/id")                       |
| [jobId](#jobid)                 | `integer` | Optional | cannot be null | [SyncLogRow](synclogrow-properties-jobid.md "undefined#/properties/jobId")                 |
| [operation](#operation)         | `string`  | Required | cannot be null | [SyncLogRow](synclogrow-properties-operation.md "undefined#/properties/operation")         |
| [status](#status)               | `string`  | Required | cannot be null | [SyncLogRow](synclogrow-properties-status.md "undefined#/properties/status")               |

## connectorType



`connectorType`

* is required

* Type: `string`

* cannot be null

* defined in: [SyncLogRow](synclogrow-properties-connectortype.md "undefined#/properties/connectorType")

### connectorType Type

`string`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [SyncLogRow](synclogrow-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## errorMsg



`errorMsg`

* is optional

* Type: `string`

* cannot be null

* defined in: [SyncLogRow](synclogrow-properties-errormsg.md "undefined#/properties/errorMsg")

### errorMsg Type

`string`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [SyncLogRow](synclogrow-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## jobId



`jobId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [SyncLogRow](synclogrow-properties-jobid.md "undefined#/properties/jobId")

### jobId Type

`integer`

## operation



`operation`

* is required

* Type: `string`

* cannot be null

* defined in: [SyncLogRow](synclogrow-properties-operation.md "undefined#/properties/operation")

### operation Type

`string`

## status



`status`

* is required

* Type: `string`

* cannot be null

* defined in: [SyncLogRow](synclogrow-properties-status.md "undefined#/properties/status")

### status Type

`string`

### status Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"success"` |             |
| `"error"`   |             |
