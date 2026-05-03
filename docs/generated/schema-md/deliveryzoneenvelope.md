# DeliveryZoneEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DeliveryZoneEnvelope.schema.json](../schema-json/DeliveryZoneEnvelope.schema.json "open original schema") |

## DeliveryZoneEnvelope Type

`object` ([DeliveryZoneEnvelope](deliveryzoneenvelope.md))

# DeliveryZoneEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [DeliveryZoneEnvelope](deliveryzone.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [DeliveryZoneEnvelope](deliveryzoneenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([DeliveryZone](deliveryzone.md))

* cannot be null

* defined in: [DeliveryZoneEnvelope](deliveryzone.md "undefined#/properties/data")

### data Type

`object` ([DeliveryZone](deliveryzone.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [DeliveryZoneEnvelope](deliveryzoneenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
