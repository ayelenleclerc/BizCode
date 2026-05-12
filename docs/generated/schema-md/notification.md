# Notification Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [NotificationListEnvelope.schema.json\*](../schema-json/NotificationListEnvelope.schema.json "open original schema") |

## items Type

`object` ([Notification](notification.md))

# items Properties

| Property                | Type      | Required | Nullable       | Defined by                                                                             |
| :---------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------- |
| [createdAt](#createdat) | `string`  | Required | cannot be null | [Notification](notification-properties-createdat.md "undefined#/properties/createdAt") |
| [id](#id)               | `integer` | Required | cannot be null | [Notification](notification-properties-id.md "undefined#/properties/id")               |
| [payload](#payload)     | `object`  | Required | cannot be null | [Notification](notification-properties-payload.md "undefined#/properties/payload")     |
| [readAt](#readat)       | `string`  | Optional | cannot be null | [Notification](notification-properties-readat.md "undefined#/properties/readAt")       |
| [tenantId](#tenantid)   | `integer` | Required | cannot be null | [Notification](notification-properties-tenantid.md "undefined#/properties/tenantId")   |
| [type](#type)           | `string`  | Required | cannot be null | [Notification](notification-properties-type.md "undefined#/properties/type")           |
| [userId](#userid)       | `integer` | Required | cannot be null | [Notification](notification-properties-userid.md "undefined#/properties/userId")       |

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [Notification](notification-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [Notification](notification-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## payload



`payload`

* is required

* Type: `object` ([Details](notification-properties-payload.md))

* cannot be null

* defined in: [Notification](notification-properties-payload.md "undefined#/properties/payload")

### payload Type

`object` ([Details](notification-properties-payload.md))

## readAt



`readAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [Notification](notification-properties-readat.md "undefined#/properties/readAt")

### readAt Type

`string`

### readAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [Notification](notification-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## type



`type`

* is required

* Type: `string`

* cannot be null

* defined in: [Notification](notification-properties-type.md "undefined#/properties/type")

### type Type

`string`

## userId



`userId`

* is required

* Type: `integer`

* cannot be null

* defined in: [Notification](notification-properties-userid.md "undefined#/properties/userId")

### userId Type

`integer`
