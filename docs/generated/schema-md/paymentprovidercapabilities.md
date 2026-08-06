# PaymentProviderCapabilities Schema

```txt
undefined#/properties/capabilities
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PaymentProviderStatusEntry.schema.json\*](../schema-json/PaymentProviderStatusEntry.schema.json "open original schema") |

## capabilities Type

`object` ([PaymentProviderCapabilities](paymentprovidercapabilities.md))

# capabilities Properties

| Property                                                | Type      | Required | Nullable       | Defined by                                                                                                                                           |
| :------------------------------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| [displayName](#displayname)                             | `string`  | Required | cannot be null | [PaymentProviderCapabilities](paymentprovidercapabilities-properties-displayname.md "undefined#/properties/displayName")                             |
| [implemented](#implemented)                             | `boolean` | Required | cannot be null | [PaymentProviderCapabilities](paymentprovidercapabilities-properties-implemented.md "undefined#/properties/implemented")                             |
| [notes](#notes)                                         | `string`  | Optional | cannot be null | [PaymentProviderCapabilities](paymentprovidercapabilities-properties-notes.md "undefined#/properties/notes")                                         |
| [provider](#provider)                                   | `string`  | Required | cannot be null | [PaymentProviderCapabilities](paymentprovidercode.md "undefined#/properties/provider")                                                               |
| [supportsCancellation](#supportscancellation)           | `boolean` | Required | cannot be null | [PaymentProviderCapabilities](paymentprovidercapabilities-properties-supportscancellation.md "undefined#/properties/supportsCancellation")           |
| [supportsCheckoutUrl](#supportscheckouturl)             | `boolean` | Required | cannot be null | [PaymentProviderCapabilities](paymentprovidercapabilities-properties-supportscheckouturl.md "undefined#/properties/supportsCheckoutUrl")             |
| [supportsEmbeddedCheckout](#supportsembeddedcheckout)   | `boolean` | Required | cannot be null | [PaymentProviderCapabilities](paymentprovidercapabilities-properties-supportsembeddedcheckout.md "undefined#/properties/supportsEmbeddedCheckout")   |
| [supportsOAuth](#supportsoauth)                         | `boolean` | Required | cannot be null | [PaymentProviderCapabilities](paymentprovidercapabilities-properties-supportsoauth.md "undefined#/properties/supportsOAuth")                         |
| [supportsPartialRefunds](#supportspartialrefunds)       | `boolean` | Required | cannot be null | [PaymentProviderCapabilities](paymentprovidercapabilities-properties-supportspartialrefunds.md "undefined#/properties/supportsPartialRefunds")       |
| [supportsQr](#supportsqr)                               | `boolean` | Required | cannot be null | [PaymentProviderCapabilities](paymentprovidercapabilities-properties-supportsqr.md "undefined#/properties/supportsQr")                               |
| [supportsRecurringPayments](#supportsrecurringpayments) | `boolean` | Required | cannot be null | [PaymentProviderCapabilities](paymentprovidercapabilities-properties-supportsrecurringpayments.md "undefined#/properties/supportsRecurringPayments") |
| [supportsRefunds](#supportsrefunds)                     | `boolean` | Required | cannot be null | [PaymentProviderCapabilities](paymentprovidercapabilities-properties-supportsrefunds.md "undefined#/properties/supportsRefunds")                     |
| [supportsSandbox](#supportssandbox)                     | `boolean` | Required | cannot be null | [PaymentProviderCapabilities](paymentprovidercapabilities-properties-supportssandbox.md "undefined#/properties/supportsSandbox")                     |

## displayName



`displayName`

* is required

* Type: `string`

* cannot be null

* defined in: [PaymentProviderCapabilities](paymentprovidercapabilities-properties-displayname.md "undefined#/properties/displayName")

### displayName Type

`string`

## implemented



`implemented`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PaymentProviderCapabilities](paymentprovidercapabilities-properties-implemented.md "undefined#/properties/implemented")

### implemented Type

`boolean`

## notes



`notes`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentProviderCapabilities](paymentprovidercapabilities-properties-notes.md "undefined#/properties/notes")

### notes Type

`string`

## provider



`provider`

* is required

* Type: `string` ([PaymentProviderCode](paymentprovidercode.md))

* cannot be null

* defined in: [PaymentProviderCapabilities](paymentprovidercode.md "undefined#/properties/provider")

### provider Type

`string` ([PaymentProviderCode](paymentprovidercode.md))

### provider Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"mercadopago"` |             |
| `"payway"`      |             |
| `"stripe"`      |             |

## supportsCancellation



`supportsCancellation`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PaymentProviderCapabilities](paymentprovidercapabilities-properties-supportscancellation.md "undefined#/properties/supportsCancellation")

### supportsCancellation Type

`boolean`

## supportsCheckoutUrl



`supportsCheckoutUrl`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PaymentProviderCapabilities](paymentprovidercapabilities-properties-supportscheckouturl.md "undefined#/properties/supportsCheckoutUrl")

### supportsCheckoutUrl Type

`boolean`

## supportsEmbeddedCheckout



`supportsEmbeddedCheckout`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PaymentProviderCapabilities](paymentprovidercapabilities-properties-supportsembeddedcheckout.md "undefined#/properties/supportsEmbeddedCheckout")

### supportsEmbeddedCheckout Type

`boolean`

## supportsOAuth



`supportsOAuth`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PaymentProviderCapabilities](paymentprovidercapabilities-properties-supportsoauth.md "undefined#/properties/supportsOAuth")

### supportsOAuth Type

`boolean`

## supportsPartialRefunds



`supportsPartialRefunds`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PaymentProviderCapabilities](paymentprovidercapabilities-properties-supportspartialrefunds.md "undefined#/properties/supportsPartialRefunds")

### supportsPartialRefunds Type

`boolean`

## supportsQr



`supportsQr`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PaymentProviderCapabilities](paymentprovidercapabilities-properties-supportsqr.md "undefined#/properties/supportsQr")

### supportsQr Type

`boolean`

## supportsRecurringPayments



`supportsRecurringPayments`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PaymentProviderCapabilities](paymentprovidercapabilities-properties-supportsrecurringpayments.md "undefined#/properties/supportsRecurringPayments")

### supportsRecurringPayments Type

`boolean`

## supportsRefunds



`supportsRefunds`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PaymentProviderCapabilities](paymentprovidercapabilities-properties-supportsrefunds.md "undefined#/properties/supportsRefunds")

### supportsRefunds Type

`boolean`

## supportsSandbox



`supportsSandbox`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PaymentProviderCapabilities](paymentprovidercapabilities-properties-supportssandbox.md "undefined#/properties/supportsSandbox")

### supportsSandbox Type

`boolean`
