# SuperadminSecurityEventsEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SuperadminSecurityEventsEnvelope.schema.json](../schema-json/SuperadminSecurityEventsEnvelope.schema.json "open original schema") |

## SuperadminSecurityEventsEnvelope Type

`object` ([SuperadminSecurityEventsEnvelope](superadminsecurityeventsenvelope.md))

# SuperadminSecurityEventsEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [SuperadminSecurityEventsEnvelope](superadminsecurityeventsenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [SuperadminSecurityEventsEnvelope](superadminsecurityeventsenvelope-properties-success.md "undefined#/properties/success") |
| [total](#total)     | `integer` | Required | cannot be null | [SuperadminSecurityEventsEnvelope](superadminsecurityeventsenvelope-properties-total.md "undefined#/properties/total")     |

## data



`data`

* is required

* Type: `object[]` ([SuperadminSecurityEvent](superadminsecurityevent.md))

* cannot be null

* defined in: [SuperadminSecurityEventsEnvelope](superadminsecurityeventsenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([SuperadminSecurityEvent](superadminsecurityevent.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SuperadminSecurityEventsEnvelope](superadminsecurityeventsenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```

## total



`total`

* is required

* Type: `integer`

* cannot be null

* defined in: [SuperadminSecurityEventsEnvelope](superadminsecurityeventsenvelope-properties-total.md "undefined#/properties/total")

### total Type

`integer`

### total Constraints

**minimum**: the value of this number must greater than or equal to: `0`
