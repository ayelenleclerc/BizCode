# NotificationEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [NotificationEnvelope.schema.json](../schema-json/NotificationEnvelope.schema.json "open original schema") |

## NotificationEnvelope Type

`object` ([NotificationEnvelope](notificationenvelope.md))

# NotificationEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [NotificationEnvelope](notification.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [NotificationEnvelope](notificationenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Notification](notification.md))

* cannot be null

* defined in: [NotificationEnvelope](notification.md "undefined#/properties/data")

### data Type

`object` ([Notification](notification.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [NotificationEnvelope](notificationenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
