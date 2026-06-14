# MercadoPagoReconciliationEntry Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoReconciliationListEnvelope.schema.json\*](../schema-json/MercadoPagoReconciliationListEnvelope.schema.json "open original schema") |

## items Type

`object` ([MercadoPagoReconciliationEntry](mercadopagoreconciliationentry.md))

# items Properties

| Property                                    | Type     | Required | Nullable       | Defined by                                                                                                                                     |
| :------------------------------------------ | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| [createdAt](#createdat)                     | `string` | Required | cannot be null | [MercadoPagoReconciliationEntry](mercadopagoreconciliationentry-properties-createdat.md "undefined#/properties/createdAt")                     |
| [currencyId](#currencyid)                   | `string` | Required | cannot be null | [MercadoPagoReconciliationEntry](mercadopagoreconciliationentry-properties-currencyid.md "undefined#/properties/currencyId")                   |
| [externalReference](#externalreference)     | `string` | Required | cannot be null | [MercadoPagoReconciliationEntry](mercadopagoreconciliationentry-properties-externalreference.md "undefined#/properties/externalReference")     |
| [mpPaymentId](#mppaymentid)                 | `string` | Required | cannot be null | [MercadoPagoReconciliationEntry](mercadopagoreconciliationentry-properties-mppaymentid.md "undefined#/properties/mpPaymentId")                 |
| [payerEmail](#payeremail)                   | `string` | Required | cannot be null | [MercadoPagoReconciliationEntry](mercadopagoreconciliationentry-properties-payeremail.md "undefined#/properties/payerEmail")                   |
| [payerIdentification](#payeridentification) | `string` | Required | cannot be null | [MercadoPagoReconciliationEntry](mercadopagoreconciliationentry-properties-payeridentification.md "undefined#/properties/payerIdentification") |
| [payerName](#payername)                     | `string` | Required | cannot be null | [MercadoPagoReconciliationEntry](mercadopagoreconciliationentry-properties-payername.md "undefined#/properties/payerName")                     |
| [paymentDate](#paymentdate)                 | `string` | Required | cannot be null | [MercadoPagoReconciliationEntry](mercadopagoreconciliationentry-properties-paymentdate.md "undefined#/properties/paymentDate")                 |
| [preferenceId](#preferenceid)               | `string` | Required | cannot be null | [MercadoPagoReconciliationEntry](mercadopagoreconciliationentry-properties-preferenceid.md "undefined#/properties/preferenceId")               |
| [transactionAmount](#transactionamount)     | `string` | Required | cannot be null | [MercadoPagoReconciliationEntry](mercadopagoreconciliationentry-properties-transactionamount.md "undefined#/properties/transactionAmount")     |

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoReconciliationEntry](mercadopagoreconciliationentry-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## currencyId



`currencyId`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoReconciliationEntry](mercadopagoreconciliationentry-properties-currencyid.md "undefined#/properties/currencyId")

### currencyId Type

`string`

## externalReference



`externalReference`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoReconciliationEntry](mercadopagoreconciliationentry-properties-externalreference.md "undefined#/properties/externalReference")

### externalReference Type

`string`

## mpPaymentId



`mpPaymentId`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoReconciliationEntry](mercadopagoreconciliationentry-properties-mppaymentid.md "undefined#/properties/mpPaymentId")

### mpPaymentId Type

`string`

## payerEmail



`payerEmail`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoReconciliationEntry](mercadopagoreconciliationentry-properties-payeremail.md "undefined#/properties/payerEmail")

### payerEmail Type

`string`

## payerIdentification



`payerIdentification`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoReconciliationEntry](mercadopagoreconciliationentry-properties-payeridentification.md "undefined#/properties/payerIdentification")

### payerIdentification Type

`string`

## payerName



`payerName`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoReconciliationEntry](mercadopagoreconciliationentry-properties-payername.md "undefined#/properties/payerName")

### payerName Type

`string`

## paymentDate



`paymentDate`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoReconciliationEntry](mercadopagoreconciliationentry-properties-paymentdate.md "undefined#/properties/paymentDate")

### paymentDate Type

`string`

### paymentDate Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## preferenceId



`preferenceId`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoReconciliationEntry](mercadopagoreconciliationentry-properties-preferenceid.md "undefined#/properties/preferenceId")

### preferenceId Type

`string`

## transactionAmount



`transactionAmount`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoReconciliationEntry](mercadopagoreconciliationentry-properties-transactionamount.md "undefined#/properties/transactionAmount")

### transactionAmount Type

`string`
