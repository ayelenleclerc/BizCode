# SaasBillingWebhookInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SaasBillingWebhookInput.schema.json](../schema-json/SaasBillingWebhookInput.schema.json "open original schema") |

## SaasBillingWebhookInput Type

`object` ([SaasBillingWebhookInput](saasbillingwebhookinput.md))

# SaasBillingWebhookInput Properties

| Property              | Type      | Required | Nullable       | Defined by                                                                                                 |
| :-------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [data](#data)         | `object`  | Optional | cannot be null | [SaasBillingWebhookInput](saasbillingwebhookinput-properties-data.md "undefined#/properties/data")         |
| [id](#id)             | `string`  | Optional | cannot be null | [SaasBillingWebhookInput](saasbillingwebhookinput-properties-id.md "undefined#/properties/id")             |
| [outcome](#outcome)   | `string`  | Optional | cannot be null | [SaasBillingWebhookInput](saasbillingwebhookinput-properties-outcome.md "undefined#/properties/outcome")   |
| [tenantId](#tenantid) | `integer` | Optional | cannot be null | [SaasBillingWebhookInput](saasbillingwebhookinput-properties-tenantid.md "undefined#/properties/tenantId") |
| [type](#type)         | `string`  | Required | cannot be null | [SaasBillingWebhookInput](saasbillingwebhookinput-properties-type.md "undefined#/properties/type")         |

## data



`data`

* is optional

* Type: `object` ([Details](saasbillingwebhookinput-properties-data.md))

* cannot be null

* defined in: [SaasBillingWebhookInput](saasbillingwebhookinput-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](saasbillingwebhookinput-properties-data.md))

## id



`id`

* is optional

* Type: `string`

* cannot be null

* defined in: [SaasBillingWebhookInput](saasbillingwebhookinput-properties-id.md "undefined#/properties/id")

### id Type

`string`

## outcome



`outcome`

* is optional

* Type: `string`

* cannot be null

* defined in: [SaasBillingWebhookInput](saasbillingwebhookinput-properties-outcome.md "undefined#/properties/outcome")

### outcome Type

`string`

### outcome Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"authorized"` |             |
| `"paid"`       |             |
| `"failed"`     |             |

## tenantId



`tenantId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [SaasBillingWebhookInput](saasbillingwebhookinput-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## type



`type`

* is required

* Type: `string`

* cannot be null

* defined in: [SaasBillingWebhookInput](saasbillingwebhookinput-properties-type.md "undefined#/properties/type")

### type Type

`string`
