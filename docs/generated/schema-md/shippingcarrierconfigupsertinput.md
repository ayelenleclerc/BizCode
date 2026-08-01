# ShippingCarrierConfigUpsertInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ShippingCarrierConfigUpsertInput.schema.json](../schema-json/ShippingCarrierConfigUpsertInput.schema.json "open original schema") |

## ShippingCarrierConfigUpsertInput Type

`object` ([ShippingCarrierConfigUpsertInput](shippingcarrierconfigupsertinput.md))

# ShippingCarrierConfigUpsertInput Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                                                         |
| :-------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| [activo](#activo)           | `boolean` | Optional | cannot be null | [ShippingCarrierConfigUpsertInput](shippingcarrierconfigupsertinput-properties-activo.md "undefined#/properties/activo")           |
| [password](#password)       | `string`  | Required | cannot be null | [ShippingCarrierConfigUpsertInput](shippingcarrierconfigupsertinput-properties-password.md "undefined#/properties/password")       |
| [sandboxMode](#sandboxmode) | `boolean` | Optional | cannot be null | [ShippingCarrierConfigUpsertInput](shippingcarrierconfigupsertinput-properties-sandboxmode.md "undefined#/properties/sandboxMode") |
| [username](#username)       | `string`  | Required | cannot be null | [ShippingCarrierConfigUpsertInput](shippingcarrierconfigupsertinput-properties-username.md "undefined#/properties/username")       |

## activo



`activo`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [ShippingCarrierConfigUpsertInput](shippingcarrierconfigupsertinput-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## password



`password`

* is required

* Type: `string`

* cannot be null

* defined in: [ShippingCarrierConfigUpsertInput](shippingcarrierconfigupsertinput-properties-password.md "undefined#/properties/password")

### password Type

`string`

### password Constraints

**maximum length**: the maximum number of characters for this string is: `200`

**minimum length**: the minimum number of characters for this string is: `1`

## sandboxMode



`sandboxMode`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [ShippingCarrierConfigUpsertInput](shippingcarrierconfigupsertinput-properties-sandboxmode.md "undefined#/properties/sandboxMode")

### sandboxMode Type

`boolean`

## username



`username`

* is required

* Type: `string`

* cannot be null

* defined in: [ShippingCarrierConfigUpsertInput](shippingcarrierconfigupsertinput-properties-username.md "undefined#/properties/username")

### username Type

`string`

### username Constraints

**maximum length**: the maximum number of characters for this string is: `120`

**minimum length**: the minimum number of characters for this string is: `1`
