# SaasBillingList Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SaasBillingListEnvelope.schema.json\*](../schema-json/SaasBillingListEnvelope.schema.json "open original schema") |

## data Type

`object` ([SaasBillingList](saasbillinglist.md))

# data Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                             |
| :-------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [invoices](#invoices)             | `array`   | Required | cannot be null | [SaasBillingList](saasbillinglist-properties-invoices.md "undefined#/properties/invoices")             |
| [platformMpLive](#platformmplive) | `boolean` | Required | cannot be null | [SaasBillingList](saasbillinglist-properties-platformmplive.md "undefined#/properties/platformMpLive") |
| [saasStatus](#saasstatus)         | `string`  | Required | cannot be null | [SaasBillingList](saasbillinglist-properties-saasstatus.md "undefined#/properties/saasStatus")         |
| [subscription](#subscription)     | Merged    | Required | cannot be null | [SaasBillingList](saasbillinglist-properties-subscription.md "undefined#/properties/subscription")     |

## invoices



`invoices`

* is required

* Type: `object[]` ([SaasInvoice](saasinvoice.md))

* cannot be null

* defined in: [SaasBillingList](saasbillinglist-properties-invoices.md "undefined#/properties/invoices")

### invoices Type

`object[]` ([SaasInvoice](saasinvoice.md))

## platformMpLive



`platformMpLive`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SaasBillingList](saasbillinglist-properties-platformmplive.md "undefined#/properties/platformMpLive")

### platformMpLive Type

`boolean`

## saasStatus



`saasStatus`

* is required

* Type: `string`

* cannot be null

* defined in: [SaasBillingList](saasbillinglist-properties-saasstatus.md "undefined#/properties/saasStatus")

### saasStatus Type

`string`

## subscription



`subscription`

* is required

* Type: merged type ([Details](saasbillinglist-properties-subscription.md))

* cannot be null

* defined in: [SaasBillingList](saasbillinglist-properties-subscription.md "undefined#/properties/subscription")

### subscription Type

merged type ([Details](saasbillinglist-properties-subscription.md))

one (and only one) of

* [Untitled null in SaasBillingList](saasbillinglist-properties-subscription-oneof-0.md "check type definition")

* [SaasBillingSubscription](saasbillingsubscription.md "check type definition")
