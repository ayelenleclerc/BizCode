# MercadoPagoReconciliationJobSummary Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoReconciliationJobSummary.schema.json](../schema-json/MercadoPagoReconciliationJobSummary.schema.json "open original schema") |

## MercadoPagoReconciliationJobSummary Type

`object` ([MercadoPagoReconciliationJobSummary](mercadopagoreconciliationjobsummary.md))

# MercadoPagoReconciliationJobSummary Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                                                                     |
| :-------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| [autoReconciled](#autoreconciled) | `integer` | Required | cannot be null | [MercadoPagoReconciliationJobSummary](mercadopagoreconciliationjobsummary-properties-autoreconciled.md "undefined#/properties/autoReconciled") |
| [processed](#processed)           | `integer` | Required | cannot be null | [MercadoPagoReconciliationJobSummary](mercadopagoreconciliationjobsummary-properties-processed.md "undefined#/properties/processed")           |
| [queued](#queued)                 | `integer` | Required | cannot be null | [MercadoPagoReconciliationJobSummary](mercadopagoreconciliationjobsummary-properties-queued.md "undefined#/properties/queued")                 |
| [skipped](#skipped)               | `integer` | Required | cannot be null | [MercadoPagoReconciliationJobSummary](mercadopagoreconciliationjobsummary-properties-skipped.md "undefined#/properties/skipped")               |

## autoReconciled



`autoReconciled`

* is required

* Type: `integer`

* cannot be null

* defined in: [MercadoPagoReconciliationJobSummary](mercadopagoreconciliationjobsummary-properties-autoreconciled.md "undefined#/properties/autoReconciled")

### autoReconciled Type

`integer`

### autoReconciled Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## processed



`processed`

* is required

* Type: `integer`

* cannot be null

* defined in: [MercadoPagoReconciliationJobSummary](mercadopagoreconciliationjobsummary-properties-processed.md "undefined#/properties/processed")

### processed Type

`integer`

### processed Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## queued



`queued`

* is required

* Type: `integer`

* cannot be null

* defined in: [MercadoPagoReconciliationJobSummary](mercadopagoreconciliationjobsummary-properties-queued.md "undefined#/properties/queued")

### queued Type

`integer`

### queued Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## skipped



`skipped`

* is required

* Type: `integer`

* cannot be null

* defined in: [MercadoPagoReconciliationJobSummary](mercadopagoreconciliationjobsummary-properties-skipped.md "undefined#/properties/skipped")

### skipped Type

`integer`

### skipped Constraints

**minimum**: the value of this number must greater than or equal to: `0`
