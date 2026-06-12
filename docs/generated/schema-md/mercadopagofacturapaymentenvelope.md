# MercadoPagoFacturaPaymentEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoFacturaPaymentEnvelope.schema.json](../schema-json/MercadoPagoFacturaPaymentEnvelope.schema.json "open original schema") |

## MercadoPagoFacturaPaymentEnvelope Type

`object` ([MercadoPagoFacturaPaymentEnvelope](mercadopagofacturapaymentenvelope.md))

# MercadoPagoFacturaPaymentEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [MercadoPagoFacturaPaymentEnvelope](mercadopagofacturapayment.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [MercadoPagoFacturaPaymentEnvelope](mercadopagofacturapaymentenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([MercadoPagoFacturaPayment](mercadopagofacturapayment.md))

* cannot be null

* defined in: [MercadoPagoFacturaPaymentEnvelope](mercadopagofacturapayment.md "undefined#/properties/data")

### data Type

`object` ([MercadoPagoFacturaPayment](mercadopagofacturapayment.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MercadoPagoFacturaPaymentEnvelope](mercadopagofacturapaymentenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
