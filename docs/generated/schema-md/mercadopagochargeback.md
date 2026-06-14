# MercadoPagoChargeback Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoChargebackListEnvelope.schema.json\*](../schema-json/MercadoPagoChargebackListEnvelope.schema.json "open original schema") |

## items Type

`object` ([MercadoPagoChargeback](mercadopagochargeback.md))

# items Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                                         |
| :-------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [createdAt](#createdat)           | `string`  | Required | cannot be null | [MercadoPagoChargeback](mercadopagochargeback-properties-createdat.md "undefined#/properties/createdAt")           |
| [estado](#estado)                 | `string`  | Required | cannot be null | [MercadoPagoChargeback](mercadopagochargeback-properties-estado.md "undefined#/properties/estado")                 |
| [facturaId](#facturaid)           | `integer` | Optional | cannot be null | [MercadoPagoChargeback](mercadopagochargeback-properties-facturaid.md "undefined#/properties/facturaId")           |
| [id](#id)                         | `integer` | Required | cannot be null | [MercadoPagoChargeback](mercadopagochargeback-properties-id.md "undefined#/properties/id")                         |
| [mpChargebackId](#mpchargebackid) | `string`  | Required | cannot be null | [MercadoPagoChargeback](mercadopagochargeback-properties-mpchargebackid.md "undefined#/properties/mpChargebackId") |
| [mpPaymentId](#mppaymentid)       | `string`  | Optional | cannot be null | [MercadoPagoChargeback](mercadopagochargeback-properties-mppaymentid.md "undefined#/properties/mpPaymentId")       |
| [notifiedAt](#notifiedat)         | `string`  | Optional | cannot be null | [MercadoPagoChargeback](mercadopagochargeback-properties-notifiedat.md "undefined#/properties/notifiedAt")         |
| [resolvedAt](#resolvedat)         | `string`  | Optional | cannot be null | [MercadoPagoChargeback](mercadopagochargeback-properties-resolvedat.md "undefined#/properties/resolvedAt")         |

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoChargeback](mercadopagochargeback-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoChargeback](mercadopagochargeback-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value         | Explanation |
| :------------ | :---------- |
| `"pendiente"` |             |
| `"resuelto"`  |             |
| `"ignorado"`  |             |

## facturaId



`facturaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [MercadoPagoChargeback](mercadopagochargeback-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

### facturaId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [MercadoPagoChargeback](mercadopagochargeback-properties-id.md "undefined#/properties/id")

### id Type

`integer`

### id Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## mpChargebackId



`mpChargebackId`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoChargeback](mercadopagochargeback-properties-mpchargebackid.md "undefined#/properties/mpChargebackId")

### mpChargebackId Type

`string`

## mpPaymentId



`mpPaymentId`

* is optional

* Type: `string`

* cannot be null

* defined in: [MercadoPagoChargeback](mercadopagochargeback-properties-mppaymentid.md "undefined#/properties/mpPaymentId")

### mpPaymentId Type

`string`

## notifiedAt



`notifiedAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [MercadoPagoChargeback](mercadopagochargeback-properties-notifiedat.md "undefined#/properties/notifiedAt")

### notifiedAt Type

`string`

### notifiedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## resolvedAt



`resolvedAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [MercadoPagoChargeback](mercadopagochargeback-properties-resolvedat.md "undefined#/properties/resolvedAt")

### resolvedAt Type

`string`

### resolvedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
