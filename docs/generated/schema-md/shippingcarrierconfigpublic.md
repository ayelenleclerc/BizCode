# ShippingCarrierConfigPublic Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ShippingCarrierConfigPublic.schema.json](../schema-json/ShippingCarrierConfigPublic.schema.json "open original schema") |

## ShippingCarrierConfigPublic Type

`object` ([ShippingCarrierConfigPublic](shippingcarrierconfigpublic.md))

# ShippingCarrierConfigPublic Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                                   |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| [activo](#activo)               | `boolean` | Required | cannot be null | [ShippingCarrierConfigPublic](shippingcarrierconfigpublic-properties-activo.md "undefined#/properties/activo")               |
| [carrier](#carrier)             | `string`  | Required | cannot be null | [ShippingCarrierConfigPublic](shippingcarrierconfigpublic-properties-carrier.md "undefined#/properties/carrier")             |
| [sandboxMode](#sandboxmode)     | `boolean` | Required | cannot be null | [ShippingCarrierConfigPublic](shippingcarrierconfigpublic-properties-sandboxmode.md "undefined#/properties/sandboxMode")     |
| [updatedAt](#updatedat)         | `string`  | Required | cannot be null | [ShippingCarrierConfigPublic](shippingcarrierconfigpublic-properties-updatedat.md "undefined#/properties/updatedAt")         |
| [usernameLast4](#usernamelast4) | `string`  | Required | cannot be null | [ShippingCarrierConfigPublic](shippingcarrierconfigpublic-properties-usernamelast4.md "undefined#/properties/usernameLast4") |

## activo



`activo`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ShippingCarrierConfigPublic](shippingcarrierconfigpublic-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## carrier



`carrier`

* is required

* Type: `string`

* cannot be null

* defined in: [ShippingCarrierConfigPublic](shippingcarrierconfigpublic-properties-carrier.md "undefined#/properties/carrier")

### carrier Type

`string`

### carrier Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                | Explanation |
| :------------------- | :---------- |
| `"andreani"`         |             |
| `"correo_argentino"` |             |

## sandboxMode



`sandboxMode`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ShippingCarrierConfigPublic](shippingcarrierconfigpublic-properties-sandboxmode.md "undefined#/properties/sandboxMode")

### sandboxMode Type

`boolean`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [ShippingCarrierConfigPublic](shippingcarrierconfigpublic-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## usernameLast4



`usernameLast4`

* is required

* Type: `string`

* cannot be null

* defined in: [ShippingCarrierConfigPublic](shippingcarrierconfigpublic-properties-usernamelast4.md "undefined#/properties/usernameLast4")

### usernameLast4 Type

`string`
