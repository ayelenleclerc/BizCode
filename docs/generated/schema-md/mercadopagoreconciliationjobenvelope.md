# MercadoPagoReconciliationJobEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoReconciliationJobEnvelope.schema.json](../schema-json/MercadoPagoReconciliationJobEnvelope.schema.json "open original schema") |

## MercadoPagoReconciliationJobEnvelope Type

`object` ([MercadoPagoReconciliationJobEnvelope](mercadopagoreconciliationjobenvelope.md))

# MercadoPagoReconciliationJobEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [MercadoPagoReconciliationJobEnvelope](mercadopagoreconciliationjobsummary.md "undefined#/properties/data")                        |
| [success](#success) | `boolean` | Required | cannot be null | [MercadoPagoReconciliationJobEnvelope](mercadopagoreconciliationjobenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([MercadoPagoReconciliationJobSummary](mercadopagoreconciliationjobsummary.md))

* cannot be null

* defined in: [MercadoPagoReconciliationJobEnvelope](mercadopagoreconciliationjobsummary.md "undefined#/properties/data")

### data Type

`object` ([MercadoPagoReconciliationJobSummary](mercadopagoreconciliationjobsummary.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MercadoPagoReconciliationJobEnvelope](mercadopagoreconciliationjobenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
