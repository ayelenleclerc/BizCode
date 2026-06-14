# MercadoPagoRefundNullableEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoRefundNullableEnvelope.schema.json](../schema-json/MercadoPagoRefundNullableEnvelope.schema.json "open original schema") |

## MercadoPagoRefundNullableEnvelope Type

`object` ([MercadoPagoRefundNullableEnvelope](mercadopagorefundnullableenvelope.md))

# MercadoPagoRefundNullableEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | Merged    | Required | cannot be null | [MercadoPagoRefundNullableEnvelope](mercadopagorefundnullableenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [MercadoPagoRefundNullableEnvelope](mercadopagorefundnullableenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: merged type ([Details](mercadopagorefundnullableenvelope-properties-data.md))

* cannot be null

* defined in: [MercadoPagoRefundNullableEnvelope](mercadopagorefundnullableenvelope-properties-data.md "undefined#/properties/data")

### data Type

merged type ([Details](mercadopagorefundnullableenvelope-properties-data.md))

one (and only one) of

* [MercadoPagoRefund](mercadopagorefund.md "check type definition")

* [Untitled null in MercadoPagoRefundNullableEnvelope](mercadopagorefundnullableenvelope-properties-data-oneof-1.md "check type definition")

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MercadoPagoRefundNullableEnvelope](mercadopagorefundnullableenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
