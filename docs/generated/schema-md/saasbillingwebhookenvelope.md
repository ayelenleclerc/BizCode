# SaasBillingWebhookEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SaasBillingWebhookEnvelope.schema.json](../schema-json/SaasBillingWebhookEnvelope.schema.json "open original schema") |

## SaasBillingWebhookEnvelope Type

`object` ([SaasBillingWebhookEnvelope](saasbillingwebhookenvelope.md))

# SaasBillingWebhookEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [SaasBillingWebhookEnvelope](saasbillingwebhookresult.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [SaasBillingWebhookEnvelope](saasbillingwebhookenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([SaasBillingWebhookResult](saasbillingwebhookresult.md))

* cannot be null

* defined in: [SaasBillingWebhookEnvelope](saasbillingwebhookresult.md "undefined#/properties/data")

### data Type

`object` ([SaasBillingWebhookResult](saasbillingwebhookresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SaasBillingWebhookEnvelope](saasbillingwebhookenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
