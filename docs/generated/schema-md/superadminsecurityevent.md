# SuperadminSecurityEvent Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SuperadminSecurityEventsEnvelope.schema.json\*](../schema-json/SuperadminSecurityEventsEnvelope.schema.json "open original schema") |

## items Type

`object` ([SuperadminSecurityEvent](superadminsecurityevent.md))

# items Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                                                   |
| :-------------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| [action](#action)                       | `string`  | Required | cannot be null | [SuperadminSecurityEvent](superadminsecurityevent-properties-action.md "undefined#/properties/action")                       |
| [createdAt](#createdat)                 | `string`  | Required | cannot be null | [SuperadminSecurityEvent](superadminsecurityevent-properties-createdat.md "undefined#/properties/createdAt")                 |
| [id](#id)                               | `integer` | Required | cannot be null | [SuperadminSecurityEvent](superadminsecurityevent-properties-id.md "undefined#/properties/id")                               |
| [ipAddress](#ipaddress)                 | `string`  | Required | cannot be null | [SuperadminSecurityEvent](superadminsecurityevent-properties-ipaddress.md "undefined#/properties/ipAddress")                 |
| [metadata](#metadata)                   | `object`  | Optional | cannot be null | [SuperadminSecurityEvent](superadminsecurityevent-properties-metadata.md "undefined#/properties/metadata")                   |
| [resource](#resource)                   | `string`  | Required | cannot be null | [SuperadminSecurityEvent](superadminsecurityevent-properties-resource.md "undefined#/properties/resource")                   |
| [resourceId](#resourceid)               | `string`  | Required | cannot be null | [SuperadminSecurityEvent](superadminsecurityevent-properties-resourceid.md "undefined#/properties/resourceId")               |
| [securityEventType](#securityeventtype) | `string`  | Required | cannot be null | [SuperadminSecurityEvent](superadminsecurityevent-properties-securityeventtype.md "undefined#/properties/securityEventType") |
| [severity](#severity)                   | `string`  | Required | cannot be null | [SuperadminSecurityEvent](superadminsecurityevent-properties-severity.md "undefined#/properties/severity")                   |
| [tenantId](#tenantid)                   | `integer` | Required | cannot be null | [SuperadminSecurityEvent](superadminsecurityevent-properties-tenantid.md "undefined#/properties/tenantId")                   |
| [tenantSlug](#tenantslug)               | `string`  | Required | cannot be null | [SuperadminSecurityEvent](superadminsecurityevent-properties-tenantslug.md "undefined#/properties/tenantSlug")               |
| [userId](#userid)                       | `integer` | Required | cannot be null | [SuperadminSecurityEvent](superadminsecurityevent-properties-userid.md "undefined#/properties/userId")                       |

## action



`action`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminSecurityEvent](superadminsecurityevent-properties-action.md "undefined#/properties/action")

### action Type

`string`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminSecurityEvent](superadminsecurityevent-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [SuperadminSecurityEvent](superadminsecurityevent-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## ipAddress



`ipAddress`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminSecurityEvent](superadminsecurityevent-properties-ipaddress.md "undefined#/properties/ipAddress")

### ipAddress Type

`string`

## metadata



`metadata`

* is optional

* Type: `object` ([Details](superadminsecurityevent-properties-metadata.md))

* cannot be null

* defined in: [SuperadminSecurityEvent](superadminsecurityevent-properties-metadata.md "undefined#/properties/metadata")

### metadata Type

`object` ([Details](superadminsecurityevent-properties-metadata.md))

## resource



`resource`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminSecurityEvent](superadminsecurityevent-properties-resource.md "undefined#/properties/resource")

### resource Type

`string`

## resourceId



`resourceId`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminSecurityEvent](superadminsecurityevent-properties-resourceid.md "undefined#/properties/resourceId")

### resourceId Type

`string`

## securityEventType



`securityEventType`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminSecurityEvent](superadminsecurityevent-properties-securityeventtype.md "undefined#/properties/securityEventType")

### securityEventType Type

`string`

## severity



`severity`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminSecurityEvent](superadminsecurityevent-properties-severity.md "undefined#/properties/severity")

### severity Type

`string`

### severity Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"critical"` |             |
| `"high"`     |             |
| `"info"`     |             |

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [SuperadminSecurityEvent](superadminsecurityevent-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## tenantSlug



`tenantSlug`

* is required

* Type: `string`

* cannot be null

* defined in: [SuperadminSecurityEvent](superadminsecurityevent-properties-tenantslug.md "undefined#/properties/tenantSlug")

### tenantSlug Type

`string`

## userId



`userId`

* is required

* Type: `integer`

* cannot be null

* defined in: [SuperadminSecurityEvent](superadminsecurityevent-properties-userid.md "undefined#/properties/userId")

### userId Type

`integer`
