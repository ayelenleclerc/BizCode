# Untitled object in PaymentCheckoutEnvelope Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PaymentCheckoutEnvelope.schema.json\*](../schema-json/PaymentCheckoutEnvelope.schema.json "open original schema") |

## data Type

`object` ([Details](paymentcheckoutenvelope-properties-data.md))

# data Properties

| Property                          | Type     | Required | Nullable       | Defined by                                                                                                                                             |
| :-------------------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [amount](#amount)                 | `number` | Optional | cannot be null | [PaymentCheckoutEnvelope](paymentcheckoutenvelope-properties-data-properties-amount.md "undefined#/properties/data/properties/amount")                 |
| [checkoutUrl](#checkouturl)       | `string` | Optional | cannot be null | [PaymentCheckoutEnvelope](paymentcheckoutenvelope-properties-data-properties-checkouturl.md "undefined#/properties/data/properties/checkoutUrl")       |
| [currency](#currency)             | `string` | Optional | cannot be null | [PaymentCheckoutEnvelope](paymentcheckoutenvelope-properties-data-properties-currency.md "undefined#/properties/data/properties/currency")             |
| [expiresAt](#expiresat)           | `string` | Optional | cannot be null | [PaymentCheckoutEnvelope](paymentcheckoutenvelope-properties-data-properties-expiresat.md "undefined#/properties/data/properties/expiresAt")           |
| [preferenceId](#preferenceid)     | `string` | Optional | cannot be null | [PaymentCheckoutEnvelope](paymentcheckoutenvelope-properties-data-properties-preferenceid.md "undefined#/properties/data/properties/preferenceId")     |
| [provider](#provider)             | `string` | Required | cannot be null | [PaymentCheckoutEnvelope](paymentprovidercode.md "undefined#/properties/data/properties/provider")                                                     |
| [providerStatus](#providerstatus) | `string` | Optional | cannot be null | [PaymentCheckoutEnvelope](paymentcheckoutenvelope-properties-data-properties-providerstatus.md "undefined#/properties/data/properties/providerStatus") |
| [status](#status)                 | `string` | Required | cannot be null | [PaymentCheckoutEnvelope](paymentcheckoutenvelope-properties-data-properties-status.md "undefined#/properties/data/properties/status")                 |

## amount



`amount`

* is optional

* Type: `number`

* cannot be null

* defined in: [PaymentCheckoutEnvelope](paymentcheckoutenvelope-properties-data-properties-amount.md "undefined#/properties/data/properties/amount")

### amount Type

`number`

## checkoutUrl



`checkoutUrl`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentCheckoutEnvelope](paymentcheckoutenvelope-properties-data-properties-checkouturl.md "undefined#/properties/data/properties/checkoutUrl")

### checkoutUrl Type

`string`

## currency



`currency`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentCheckoutEnvelope](paymentcheckoutenvelope-properties-data-properties-currency.md "undefined#/properties/data/properties/currency")

### currency Type

`string`

## expiresAt



`expiresAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentCheckoutEnvelope](paymentcheckoutenvelope-properties-data-properties-expiresat.md "undefined#/properties/data/properties/expiresAt")

### expiresAt Type

`string`

### expiresAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## preferenceId



`preferenceId`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentCheckoutEnvelope](paymentcheckoutenvelope-properties-data-properties-preferenceid.md "undefined#/properties/data/properties/preferenceId")

### preferenceId Type

`string`

## provider



`provider`

* is required

* Type: `string` ([PaymentProviderCode](paymentprovidercode.md))

* cannot be null

* defined in: [PaymentCheckoutEnvelope](paymentprovidercode.md "undefined#/properties/data/properties/provider")

### provider Type

`string` ([PaymentProviderCode](paymentprovidercode.md))

### provider Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"mercadopago"` |             |
| `"payway"`      |             |
| `"stripe"`      |             |

## providerStatus



`providerStatus`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentCheckoutEnvelope](paymentcheckoutenvelope-properties-data-properties-providerstatus.md "undefined#/properties/data/properties/providerStatus")

### providerStatus Type

`string`

## status



`status`

* is required

* Type: `string`

* cannot be null

* defined in: [PaymentCheckoutEnvelope](paymentcheckoutenvelope-properties-data-properties-status.md "undefined#/properties/data/properties/status")

### status Type

`string`
