# PaymentCheckoutEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PaymentCheckoutEnvelope.schema.json](../schema-json/PaymentCheckoutEnvelope.schema.json "open original schema") |

## PaymentCheckoutEnvelope Type

`object` ([PaymentCheckoutEnvelope](paymentcheckoutenvelope.md))

# PaymentCheckoutEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [PaymentCheckoutEnvelope](paymentcheckoutenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [PaymentCheckoutEnvelope](paymentcheckoutenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Details](paymentcheckoutenvelope-properties-data.md))

* cannot be null

* defined in: [PaymentCheckoutEnvelope](paymentcheckoutenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](paymentcheckoutenvelope-properties-data.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PaymentCheckoutEnvelope](paymentcheckoutenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
