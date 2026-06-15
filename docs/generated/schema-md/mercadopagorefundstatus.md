# MercadoPagoRefundStatus Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoRefundStatusEnvelope.schema.json\*](../schema-json/MercadoPagoRefundStatusEnvelope.schema.json "open original schema") |

## data Type

`object` ([MercadoPagoRefundStatus](mercadopagorefundstatus.md))

# data Properties

| Property                                        | Type     | Required | Nullable       | Defined by                                                                                                                           |
| :---------------------------------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| [originalPaymentAmount](#originalpaymentamount) | `string` | Required | cannot be null | [MercadoPagoRefundStatus](mercadopagorefundstatus-properties-originalpaymentamount.md "undefined#/properties/originalPaymentAmount") |
| [refundableBalance](#refundablebalance)         | `string` | Required | cannot be null | [MercadoPagoRefundStatus](mercadopagorefundstatus-properties-refundablebalance.md "undefined#/properties/refundableBalance")         |
| [refunds](#refunds)                             | `array`  | Required | cannot be null | [MercadoPagoRefundStatus](mercadopagorefundstatus-properties-refunds.md "undefined#/properties/refunds")                             |

## originalPaymentAmount



`originalPaymentAmount`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoRefundStatus](mercadopagorefundstatus-properties-originalpaymentamount.md "undefined#/properties/originalPaymentAmount")

### originalPaymentAmount Type

`string`

## refundableBalance



`refundableBalance`

* is required

* Type: `string`

* cannot be null

* defined in: [MercadoPagoRefundStatus](mercadopagorefundstatus-properties-refundablebalance.md "undefined#/properties/refundableBalance")

### refundableBalance Type

`string`

## refunds



`refunds`

* is required

* Type: `object[]` ([MercadoPagoRefund](mercadopagorefund.md))

* cannot be null

* defined in: [MercadoPagoRefundStatus](mercadopagorefundstatus-properties-refunds.md "undefined#/properties/refunds")

### refunds Type

`object[]` ([MercadoPagoRefund](mercadopagorefund.md))
