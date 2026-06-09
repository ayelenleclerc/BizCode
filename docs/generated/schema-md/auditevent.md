# AuditEvent Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [AuditEventListEnvelope.schema.json\*](../schema-json/AuditEventListEnvelope.schema.json "open original schema") |

## items Type

`object` ([AuditEvent](auditevent.md))

# items Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                           |
| :------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------- |
| [action](#action)         | `string`  | Required | cannot be null | [AuditEvent](auditevent-properties-action.md "undefined#/properties/action")         |
| [createdAt](#createdat)   | `string`  | Required | cannot be null | [AuditEvent](auditevent-properties-createdat.md "undefined#/properties/createdAt")   |
| [id](#id)                 | `integer` | Required | cannot be null | [AuditEvent](auditevent-properties-id.md "undefined#/properties/id")                 |
| [ipAddress](#ipaddress)   | `string`  | Optional | cannot be null | [AuditEvent](auditevent-properties-ipaddress.md "undefined#/properties/ipAddress")   |
| [metadata](#metadata)     | Merged    | Optional | cannot be null | [AuditEvent](auditevent-properties-metadata.md "undefined#/properties/metadata")     |
| [resource](#resource)     | `string`  | Required | cannot be null | [AuditEvent](auditevent-properties-resource.md "undefined#/properties/resource")     |
| [resourceId](#resourceid) | `string`  | Optional | cannot be null | [AuditEvent](auditevent-properties-resourceid.md "undefined#/properties/resourceId") |
| [tenantId](#tenantid)     | `integer` | Required | cannot be null | [AuditEvent](auditevent-properties-tenantid.md "undefined#/properties/tenantId")     |
| [userId](#userid)         | `integer` | Optional | cannot be null | [AuditEvent](auditevent-properties-userid.md "undefined#/properties/userId")         |
| [username](#username)     | `string`  | Optional | cannot be null | [AuditEvent](auditevent-properties-username.md "undefined#/properties/username")     |

## action



`action`

* is required

* Type: `string`

* cannot be null

* defined in: [AuditEvent](auditevent-properties-action.md "undefined#/properties/action")

### action Type

`string`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [AuditEvent](auditevent-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [AuditEvent](auditevent-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## ipAddress



`ipAddress`

* is optional

* Type: `string`

* cannot be null

* defined in: [AuditEvent](auditevent-properties-ipaddress.md "undefined#/properties/ipAddress")

### ipAddress Type

`string`

## metadata

Optional structured details for the event

`metadata`

* is optional

* Type: merged type ([Details](auditevent-properties-metadata.md))

* cannot be null

* defined in: [AuditEvent](auditevent-properties-metadata.md "undefined#/properties/metadata")

### metadata Type

merged type ([Details](auditevent-properties-metadata.md))

any of

* [Untitled object in AuditEvent](auditevent-properties-metadata-anyof-0.md "check type definition")

* [Untitled null in AuditEvent](auditevent-properties-metadata-anyof-1.md "check type definition")

## resource



`resource`

* is required

* Type: `string`

* cannot be null

* defined in: [AuditEvent](auditevent-properties-resource.md "undefined#/properties/resource")

### resource Type

`string`

## resourceId



`resourceId`

* is optional

* Type: `string`

* cannot be null

* defined in: [AuditEvent](auditevent-properties-resourceid.md "undefined#/properties/resourceId")

### resourceId Type

`string`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [AuditEvent](auditevent-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## userId



`userId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [AuditEvent](auditevent-properties-userid.md "undefined#/properties/userId")

### userId Type

`integer`

## username

Username of the actor when resolved; otherwise null

`username`

* is optional

* Type: `string`

* cannot be null

* defined in: [AuditEvent](auditevent-properties-username.md "undefined#/properties/username")

### username Type

`string`
