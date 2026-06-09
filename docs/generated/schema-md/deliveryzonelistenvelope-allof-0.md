# Untitled object in DeliveryZoneListEnvelope Schema

```txt
undefined#/allOf/0
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DeliveryZoneListEnvelope.schema.json\*](../schema-json/DeliveryZoneListEnvelope.schema.json "open original schema") |

## 0 Type

`object` ([Details](deliveryzonelistenvelope-allof-0.md))

# 0 Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [DeliveryZoneListEnvelope](deliveryzonelistenvelope-allof-0-properties-data.md "undefined#/allOf/0/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [DeliveryZoneListEnvelope](deliveryzonelistenvelope-allof-0-properties-success.md "undefined#/allOf/0/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([DeliveryZone](deliveryzone.md))

* cannot be null

* defined in: [DeliveryZoneListEnvelope](deliveryzonelistenvelope-allof-0-properties-data.md "undefined#/allOf/0/properties/data")

### data Type

`object[]` ([DeliveryZone](deliveryzone.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [DeliveryZoneListEnvelope](deliveryzonelistenvelope-allof-0-properties-success.md "undefined#/allOf/0/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
