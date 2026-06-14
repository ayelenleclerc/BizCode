# MercadoPagoChargebackListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoChargebackListEnvelope.schema.json](../schema-json/MercadoPagoChargebackListEnvelope.schema.json "open original schema") |

## MercadoPagoChargebackListEnvelope Type

`object` ([MercadoPagoChargebackListEnvelope](mercadopagochargebacklistenvelope.md))

# MercadoPagoChargebackListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [MercadoPagoChargebackListEnvelope](mercadopagochargebacklistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [MercadoPagoChargebackListEnvelope](mercadopagochargebacklistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([MercadoPagoChargeback](mercadopagochargeback.md))

* cannot be null

* defined in: [MercadoPagoChargebackListEnvelope](mercadopagochargebacklistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([MercadoPagoChargeback](mercadopagochargeback.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MercadoPagoChargebackListEnvelope](mercadopagochargebacklistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
