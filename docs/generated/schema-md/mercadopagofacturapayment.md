# MercadoPagoFacturaPayment Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoFacturaPaymentEnvelope.schema.json\*](../schema-json/MercadoPagoFacturaPaymentEnvelope.schema.json "open original schema") |

## data Type

`object` ([MercadoPagoFacturaPayment](mercadopagofacturapayment.md))

# data Properties

| Property                        | Type     | Required | Nullable       | Defined by                                                                                                               |
| :------------------------------ | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [amount](#amount)               | `string` | Optional | cannot be null | [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-amount.md "undefined#/properties/amount")               |
| [channel](#channel)             | `string` | Optional | cannot be null | [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-channel.md "undefined#/properties/channel")             |
| [estado](#estado)               | `string` | Required | cannot be null | [MercadoPagoFacturaPayment](mercadopagofacturaestado.md "undefined#/properties/estado")                                  |
| [expiresAt](#expiresat)         | `string` | Optional | cannot be null | [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-expiresat.md "undefined#/properties/expiresAt")         |
| [facturaRef](#facturaref)       | `string` | Optional | cannot be null | [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-facturaref.md "undefined#/properties/facturaRef")       |
| [pagadoAt](#pagadoat)           | `string` | Optional | cannot be null | [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-pagadoat.md "undefined#/properties/pagadoAt")           |
| [paymentLink](#paymentlink)     | `string` | Optional | cannot be null | [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-paymentlink.md "undefined#/properties/paymentLink")     |
| [preferenceId](#preferenceid)   | `string` | Optional | cannot be null | [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-preferenceid.md "undefined#/properties/preferenceId")   |
| [qrData](#qrdata)               | `string` | Optional | cannot be null | [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-qrdata.md "undefined#/properties/qrData")               |
| [qrExpiresAt](#qrexpiresat)     | `string` | Optional | cannot be null | [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-qrexpiresat.md "undefined#/properties/qrExpiresAt")     |
| [qrImageBase64](#qrimagebase64) | `string` | Optional | cannot be null | [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-qrimagebase64.md "undefined#/properties/qrImageBase64") |
| [qrOrderId](#qrorderid)         | `string` | Optional | cannot be null | [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-qrorderid.md "undefined#/properties/qrOrderId")         |

## amount



`amount`

* is optional

* Type: `string`

* cannot be null

* defined in: [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-amount.md "undefined#/properties/amount")

### amount Type

`string`

## channel



`channel`

* is optional

* Type: `string`

* cannot be null

* defined in: [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-channel.md "undefined#/properties/channel")

### channel Type

`string`

### channel Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value    | Explanation |
| :------- | :---------- |
| `"none"` |             |
| `"link"` |             |
| `"qr"`   |             |

## estado



`estado`

* is required

* Type: `string` ([MercadoPagoFacturaEstado](mercadopagofacturaestado.md))

* cannot be null

* defined in: [MercadoPagoFacturaPayment](mercadopagofacturaestado.md "undefined#/properties/estado")

### estado Type

`string` ([MercadoPagoFacturaEstado](mercadopagofacturaestado.md))

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value         | Explanation |
| :------------ | :---------- |
| `"none"`      |             |
| `"pending"`   |             |
| `"approved"`  |             |
| `"rejected"`  |             |
| `"cancelled"` |             |
| `"expired"`   |             |
| `"refunded"`  |             |

## expiresAt



`expiresAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-expiresat.md "undefined#/properties/expiresAt")

### expiresAt Type

`string`

### expiresAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## facturaRef



`facturaRef`

* is optional

* Type: `string`

* cannot be null

* defined in: [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-facturaref.md "undefined#/properties/facturaRef")

### facturaRef Type

`string`

## pagadoAt



`pagadoAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-pagadoat.md "undefined#/properties/pagadoAt")

### pagadoAt Type

`string`

### pagadoAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## paymentLink



`paymentLink`

* is optional

* Type: `string`

* cannot be null

* defined in: [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-paymentlink.md "undefined#/properties/paymentLink")

### paymentLink Type

`string`

### paymentLink Constraints

**URI**: the string must be a URI, according to [RFC 3986](https://tools.ietf.org/html/rfc3986 "check the specification")

## preferenceId



`preferenceId`

* is optional

* Type: `string`

* cannot be null

* defined in: [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-preferenceid.md "undefined#/properties/preferenceId")

### preferenceId Type

`string`

## qrData



`qrData`

* is optional

* Type: `string`

* cannot be null

* defined in: [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-qrdata.md "undefined#/properties/qrData")

### qrData Type

`string`

## qrExpiresAt



`qrExpiresAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-qrexpiresat.md "undefined#/properties/qrExpiresAt")

### qrExpiresAt Type

`string`

### qrExpiresAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## qrImageBase64



`qrImageBase64`

* is optional

* Type: `string`

* cannot be null

* defined in: [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-qrimagebase64.md "undefined#/properties/qrImageBase64")

### qrImageBase64 Type

`string`

## qrOrderId



`qrOrderId`

* is optional

* Type: `string`

* cannot be null

* defined in: [MercadoPagoFacturaPayment](mercadopagofacturapayment-properties-qrorderid.md "undefined#/properties/qrOrderId")

### qrOrderId Type

`string`
