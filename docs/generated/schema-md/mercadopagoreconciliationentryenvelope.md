# MercadoPagoReconciliationEntryEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoReconciliationEntryEnvelope.schema.json](../schema-json/MercadoPagoReconciliationEntryEnvelope.schema.json "open original schema") |

## MercadoPagoReconciliationEntryEnvelope Type

`object` ([MercadoPagoReconciliationEntryEnvelope](mercadopagoreconciliationentryenvelope.md))

# MercadoPagoReconciliationEntryEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [MercadoPagoReconciliationEntryEnvelope](mercadopagoreconciliationentry.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [MercadoPagoReconciliationEntryEnvelope](mercadopagoreconciliationentryenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([MercadoPagoReconciliationEntry](mercadopagoreconciliationentry.md))

* cannot be null

* defined in: [MercadoPagoReconciliationEntryEnvelope](mercadopagoreconciliationentry.md "undefined#/properties/data")

### data Type

`object` ([MercadoPagoReconciliationEntry](mercadopagoreconciliationentry.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MercadoPagoReconciliationEntryEnvelope](mercadopagoreconciliationentryenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
