# MercadoPagoRefundEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoRefundEnvelope.schema.json](../schema-json/MercadoPagoRefundEnvelope.schema.json "open original schema") |

## MercadoPagoRefundEnvelope Type

`object` ([MercadoPagoRefundEnvelope](mercadopagorefundenvelope.md))

# MercadoPagoRefundEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [MercadoPagoRefundEnvelope](mercadopagorefund.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [MercadoPagoRefundEnvelope](mercadopagorefundenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([MercadoPagoRefund](mercadopagorefund.md))

* cannot be null

* defined in: [MercadoPagoRefundEnvelope](mercadopagorefund.md "undefined#/properties/data")

### data Type

`object` ([MercadoPagoRefund](mercadopagorefund.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MercadoPagoRefundEnvelope](mercadopagorefundenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
