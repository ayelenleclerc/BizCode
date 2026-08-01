# ShippingCarrierConfigEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ShippingCarrierConfigEnvelope.schema.json](../schema-json/ShippingCarrierConfigEnvelope.schema.json "open original schema") |

## ShippingCarrierConfigEnvelope Type

`object` ([ShippingCarrierConfigEnvelope](shippingcarrierconfigenvelope.md))

# ShippingCarrierConfigEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ShippingCarrierConfigEnvelope](shippingcarrierconfigpublic.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [ShippingCarrierConfigEnvelope](shippingcarrierconfigenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ShippingCarrierConfigPublic](shippingcarrierconfigpublic.md))

* cannot be null

* defined in: [ShippingCarrierConfigEnvelope](shippingcarrierconfigpublic.md "undefined#/properties/data")

### data Type

`object` ([ShippingCarrierConfigPublic](shippingcarrierconfigpublic.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ShippingCarrierConfigEnvelope](shippingcarrierconfigenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
