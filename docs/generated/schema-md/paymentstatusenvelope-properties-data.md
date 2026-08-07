# Untitled object in PaymentStatusEnvelope Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PaymentStatusEnvelope.schema.json\*](../schema-json/PaymentStatusEnvelope.schema.json "open original schema") |

## data Type

`object` ([Details](paymentstatusenvelope-properties-data.md))

# data Properties

| Property                                | Type     | Required | Nullable       | Defined by                                                                                                                                               |
| :-------------------------------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [amount](#amount)                       | `number` | Optional | cannot be null | [PaymentStatusEnvelope](paymentstatusenvelope-properties-data-properties-amount.md "undefined#/properties/data/properties/amount")                       |
| [approvedAt](#approvedat)               | `string` | Optional | cannot be null | [PaymentStatusEnvelope](paymentstatusenvelope-properties-data-properties-approvedat.md "undefined#/properties/data/properties/approvedAt")               |
| [currency](#currency)                   | `string` | Optional | cannot be null | [PaymentStatusEnvelope](paymentstatusenvelope-properties-data-properties-currency.md "undefined#/properties/data/properties/currency")                   |
| [externalPaymentId](#externalpaymentid) | `string` | Optional | cannot be null | [PaymentStatusEnvelope](paymentstatusenvelope-properties-data-properties-externalpaymentid.md "undefined#/properties/data/properties/externalPaymentId") |
| [providerStatus](#providerstatus)       | `string` | Optional | cannot be null | [PaymentStatusEnvelope](paymentstatusenvelope-properties-data-properties-providerstatus.md "undefined#/properties/data/properties/providerStatus")       |
| [status](#status)                       | `string` | Required | cannot be null | [PaymentStatusEnvelope](paymentstatusenvelope-properties-data-properties-status.md "undefined#/properties/data/properties/status")                       |

## amount



`amount`

* is optional

* Type: `number`

* cannot be null

* defined in: [PaymentStatusEnvelope](paymentstatusenvelope-properties-data-properties-amount.md "undefined#/properties/data/properties/amount")

### amount Type

`number`

## approvedAt



`approvedAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentStatusEnvelope](paymentstatusenvelope-properties-data-properties-approvedat.md "undefined#/properties/data/properties/approvedAt")

### approvedAt Type

`string`

### approvedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## currency



`currency`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentStatusEnvelope](paymentstatusenvelope-properties-data-properties-currency.md "undefined#/properties/data/properties/currency")

### currency Type

`string`

## externalPaymentId



`externalPaymentId`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentStatusEnvelope](paymentstatusenvelope-properties-data-properties-externalpaymentid.md "undefined#/properties/data/properties/externalPaymentId")

### externalPaymentId Type

`string`

## providerStatus



`providerStatus`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentStatusEnvelope](paymentstatusenvelope-properties-data-properties-providerstatus.md "undefined#/properties/data/properties/providerStatus")

### providerStatus Type

`string`

## status



`status`

* is required

* Type: `string`

* cannot be null

* defined in: [PaymentStatusEnvelope](paymentstatusenvelope-properties-data-properties-status.md "undefined#/properties/data/properties/status")

### status Type

`string`
