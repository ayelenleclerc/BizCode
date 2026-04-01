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

| Property                | Type     | Required | Nullable       | Defined by                                                                                 |
| :---------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [status](#status)       | `string` | Required | cannot be null | [HealthResponse](healthresponse-properties-status.md "undefined#/properties/status")       |
| [timestamp](#timestamp) | `string` | Required | cannot be null | [HealthResponse](healthresponse-properties-timestamp.md "undefined#/properties/timestamp") |

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
