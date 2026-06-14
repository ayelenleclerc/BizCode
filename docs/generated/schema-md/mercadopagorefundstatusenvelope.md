# MercadoPagoRefundStatusEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoRefundStatusEnvelope.schema.json](../schema-json/MercadoPagoRefundStatusEnvelope.schema.json "open original schema") |

## MercadoPagoRefundStatusEnvelope Type

`object` ([MercadoPagoRefundStatusEnvelope](mercadopagorefundstatusenvelope.md))

# MercadoPagoRefundStatusEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [MercadoPagoRefundStatusEnvelope](mercadopagorefundstatus.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [MercadoPagoRefundStatusEnvelope](mercadopagorefundstatusenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([MercadoPagoRefundStatus](mercadopagorefundstatus.md))

* cannot be null

* defined in: [MercadoPagoRefundStatusEnvelope](mercadopagorefundstatus.md "undefined#/properties/data")

### data Type

`object` ([MercadoPagoRefundStatus](mercadopagorefundstatus.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MercadoPagoRefundStatusEnvelope](mercadopagorefundstatusenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
