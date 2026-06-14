# MercadoPagoReconciliationListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoReconciliationListEnvelope.schema.json](../schema-json/MercadoPagoReconciliationListEnvelope.schema.json "open original schema") |

## MercadoPagoReconciliationListEnvelope Type

`object` ([MercadoPagoReconciliationListEnvelope](mercadopagoreconciliationlistenvelope.md))

# MercadoPagoReconciliationListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [MercadoPagoReconciliationListEnvelope](mercadopagoreconciliationlistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [MercadoPagoReconciliationListEnvelope](mercadopagoreconciliationlistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([MercadoPagoReconciliationEntry](mercadopagoreconciliationentry.md))

* cannot be null

* defined in: [MercadoPagoReconciliationListEnvelope](mercadopagoreconciliationlistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([MercadoPagoReconciliationEntry](mercadopagoreconciliationentry.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MercadoPagoReconciliationListEnvelope](mercadopagoreconciliationlistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
