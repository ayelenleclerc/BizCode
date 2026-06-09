# HealthResponse Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [HealthResponse.schema.json](../schema-json/HealthResponse.schema.json "open original schema") |

## HealthResponse Type

`object` ([HealthResponse](healthresponse.md))

# HealthResponse Properties

| Property                        | Type     | Required | Nullable       | Defined by                                                                                         |
| :------------------------------ | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [db](#db)                       | `object` | Optional | cannot be null | [HealthResponse](healthresponse-properties-db.md "undefined#/properties/db")                       |
| [status](#status)               | `string` | Required | cannot be null | [HealthResponse](healthresponse-properties-status.md "undefined#/properties/status")               |
| [timestamp](#timestamp)         | `string` | Required | cannot be null | [HealthResponse](healthresponse-properties-timestamp.md "undefined#/properties/timestamp")         |
| [uptimeSeconds](#uptimeseconds) | `number` | Optional | cannot be null | [HealthResponse](healthresponse-properties-uptimeseconds.md "undefined#/properties/uptimeSeconds") |
| [version](#version)             | `string` | Optional | cannot be null | [HealthResponse](healthresponse-properties-version.md "undefined#/properties/version")             |

## db



`db`

* is optional

* Type: `object` ([Details](healthresponse-properties-db.md))

* cannot be null

* defined in: [HealthResponse](healthresponse-properties-db.md "undefined#/properties/db")

### db Type

`object` ([Details](healthresponse-properties-db.md))

## status



`status`

* is required

* Type: `string`

* cannot be null

* defined in: [HealthResponse](healthresponse-properties-status.md "undefined#/properties/status")

### status Type

`string`

## timestamp



`timestamp`

* is required

* Type: `string`

* cannot be null

* defined in: [HealthResponse](healthresponse-properties-timestamp.md "undefined#/properties/timestamp")

### timestamp Type

`string`

### timestamp Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## uptimeSeconds



`uptimeSeconds`

* is optional

* Type: `number`

* cannot be null

* defined in: [HealthResponse](healthresponse-properties-uptimeseconds.md "undefined#/properties/uptimeSeconds")

### uptimeSeconds Type

`number`

### uptimeSeconds Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## version



`version`

* is optional

* Type: `string`

* cannot be null

* defined in: [HealthResponse](healthresponse-properties-version.md "undefined#/properties/version")

### version Type

`string`
