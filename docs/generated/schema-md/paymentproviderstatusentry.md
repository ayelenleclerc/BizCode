# PaymentProviderStatusEntry Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PaymentProviderStatusListEnvelope.schema.json\*](../schema-json/PaymentProviderStatusListEnvelope.schema.json "open original schema") |

## items Type

`object` ([PaymentProviderStatusEntry](paymentproviderstatusentry.md))

# items Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                                                       |
| :------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [accessTokenLast4](#accesstokenlast4) | `string`  | Optional | cannot be null | [PaymentProviderStatusEntry](paymentproviderstatusentry-properties-accesstokenlast4.md "undefined#/properties/accessTokenLast4") |
| [capabilities](#capabilities)         | `object`  | Required | cannot be null | [PaymentProviderStatusEntry](paymentprovidercapabilities.md "undefined#/properties/capabilities")                                |
| [configured](#configured)             | `boolean` | Required | cannot be null | [PaymentProviderStatusEntry](paymentproviderstatusentry-properties-configured.md "undefined#/properties/configured")             |
| [enabled](#enabled)                   | `boolean` | Required | cannot be null | [PaymentProviderStatusEntry](paymentproviderstatusentry-properties-enabled.md "undefined#/properties/enabled")                   |
| [environment](#environment)           | `string`  | Optional | cannot be null | [PaymentProviderStatusEntry](paymentproviderstatusentry-properties-environment.md "undefined#/properties/environment")           |
| [isDefault](#isdefault)               | `boolean` | Required | cannot be null | [PaymentProviderStatusEntry](paymentproviderstatusentry-properties-isdefault.md "undefined#/properties/isDefault")               |
| [lastValidationAt](#lastvalidationat) | `string`  | Optional | cannot be null | [PaymentProviderStatusEntry](paymentproviderstatusentry-properties-lastvalidationat.md "undefined#/properties/lastValidationAt") |
| [provider](#provider)                 | `string`  | Required | cannot be null | [PaymentProviderStatusEntry](paymentprovidercode.md "undefined#/properties/provider")                                            |
| [publicKey](#publickey)               | `string`  | Optional | cannot be null | [PaymentProviderStatusEntry](paymentproviderstatusentry-properties-publickey.md "undefined#/properties/publicKey")               |
| [validationStatus](#validationstatus) | `string`  | Optional | cannot be null | [PaymentProviderStatusEntry](paymentproviderstatusentry-properties-validationstatus.md "undefined#/properties/validationStatus") |
| [webhookSecretSet](#webhooksecretset) | `boolean` | Optional | cannot be null | [PaymentProviderStatusEntry](paymentproviderstatusentry-properties-webhooksecretset.md "undefined#/properties/webhookSecretSet") |

## accessTokenLast4



`accessTokenLast4`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentProviderStatusEntry](paymentproviderstatusentry-properties-accesstokenlast4.md "undefined#/properties/accessTokenLast4")

### accessTokenLast4 Type

`string`

## capabilities



`capabilities`

* is required

* Type: `object` ([PaymentProviderCapabilities](paymentprovidercapabilities.md))

* cannot be null

* defined in: [PaymentProviderStatusEntry](paymentprovidercapabilities.md "undefined#/properties/capabilities")

### capabilities Type

`object` ([PaymentProviderCapabilities](paymentprovidercapabilities.md))

## configured



`configured`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PaymentProviderStatusEntry](paymentproviderstatusentry-properties-configured.md "undefined#/properties/configured")

### configured Type

`boolean`

## enabled



`enabled`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PaymentProviderStatusEntry](paymentproviderstatusentry-properties-enabled.md "undefined#/properties/enabled")

### enabled Type

`boolean`

## environment



`environment`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentProviderStatusEntry](paymentproviderstatusentry-properties-environment.md "undefined#/properties/environment")

### environment Type

`string`

### environment Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"sandbox"`    |             |
| `"production"` |             |

## isDefault



`isDefault`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PaymentProviderStatusEntry](paymentproviderstatusentry-properties-isdefault.md "undefined#/properties/isDefault")

### isDefault Type

`boolean`

## lastValidationAt



`lastValidationAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentProviderStatusEntry](paymentproviderstatusentry-properties-lastvalidationat.md "undefined#/properties/lastValidationAt")

### lastValidationAt Type

`string`

### lastValidationAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## provider



`provider`

* is required

* Type: `string` ([PaymentProviderCode](paymentprovidercode.md))

* cannot be null

* defined in: [PaymentProviderStatusEntry](paymentprovidercode.md "undefined#/properties/provider")

### provider Type

`string` ([PaymentProviderCode](paymentprovidercode.md))

### provider Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"mercadopago"` |             |
| `"payway"`      |             |
| `"stripe"`      |             |

## publicKey



`publicKey`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentProviderStatusEntry](paymentproviderstatusentry-properties-publickey.md "undefined#/properties/publicKey")

### publicKey Type

`string`

## validationStatus



`validationStatus`

* is optional

* Type: `string`

* cannot be null

* defined in: [PaymentProviderStatusEntry](paymentproviderstatusentry-properties-validationstatus.md "undefined#/properties/validationStatus")

### validationStatus Type

`string`

## webhookSecretSet



`webhookSecretSet`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [PaymentProviderStatusEntry](paymentproviderstatusentry-properties-webhooksecretset.md "undefined#/properties/webhookSecretSet")

### webhookSecretSet Type

`boolean`
