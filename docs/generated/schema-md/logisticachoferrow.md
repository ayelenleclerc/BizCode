# LogisticaChoferRow Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LogisticaChoferRow.schema.json](../schema-json/LogisticaChoferRow.schema.json "open original schema") |

## LogisticaChoferRow Type

`object` ([LogisticaChoferRow](logisticachoferrow.md))

# LogisticaChoferRow Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                                   |
| :-------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [choferId](#choferid)             | `integer` | Required | cannot be null | [LogisticaChoferRow](logisticachoferrow-properties-choferid.md "undefined#/properties/choferId")             |
| [choferUsername](#choferusername) | `string`  | Required | cannot be null | [LogisticaChoferRow](logisticachoferrow-properties-choferusername.md "undefined#/properties/choferUsername") |
| [day](#day)                       | `string`  | Required | cannot be null | [LogisticaChoferRow](logisticachoferrow-properties-day.md "undefined#/properties/day")                       |
| [delivered](#delivered)           | `integer` | Required | cannot be null | [LogisticaChoferRow](logisticachoferrow-properties-delivered.md "undefined#/properties/delivered")           |
| [dispatched](#dispatched)         | `integer` | Required | cannot be null | [LogisticaChoferRow](logisticachoferrow-properties-dispatched.md "undefined#/properties/dispatched")         |
| [notDelivered](#notdelivered)     | `integer` | Required | cannot be null | [LogisticaChoferRow](logisticachoferrow-properties-notdelivered.md "undefined#/properties/notDelivered")     |

## choferId



`choferId`

* is required

* Type: `integer`

* cannot be null

* defined in: [LogisticaChoferRow](logisticachoferrow-properties-choferid.md "undefined#/properties/choferId")

### choferId Type

`integer`

## choferUsername



`choferUsername`

* is required

* Type: `string`

* cannot be null

* defined in: [LogisticaChoferRow](logisticachoferrow-properties-choferusername.md "undefined#/properties/choferUsername")

### choferUsername Type

`string`

## day



`day`

* is required

* Type: `string`

* cannot be null

* defined in: [LogisticaChoferRow](logisticachoferrow-properties-day.md "undefined#/properties/day")

### day Type

`string`

### day Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## delivered



`delivered`

* is required

* Type: `integer`

* cannot be null

* defined in: [LogisticaChoferRow](logisticachoferrow-properties-delivered.md "undefined#/properties/delivered")

### delivered Type

`integer`

### delivered Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## dispatched



`dispatched`

* is required

* Type: `integer`

* cannot be null

* defined in: [LogisticaChoferRow](logisticachoferrow-properties-dispatched.md "undefined#/properties/dispatched")

### dispatched Type

`integer`

### dispatched Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## notDelivered



`notDelivered`

* is required

* Type: `integer`

* cannot be null

* defined in: [LogisticaChoferRow](logisticachoferrow-properties-notdelivered.md "undefined#/properties/notDelivered")

### notDelivered Type

`integer`

### notDelivered Constraints

**minimum**: the value of this number must greater than or equal to: `0`
