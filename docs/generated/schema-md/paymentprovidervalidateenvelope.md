# PaymentProviderValidateEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PaymentProviderValidateEnvelope.schema.json](../schema-json/PaymentProviderValidateEnvelope.schema.json "open original schema") |

## PaymentProviderValidateEnvelope Type

`object` ([PaymentProviderValidateEnvelope](paymentprovidervalidateenvelope.md))

# PaymentProviderValidateEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [PaymentProviderValidateEnvelope](paymentprovidervalidateenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [PaymentProviderValidateEnvelope](paymentprovidervalidateenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Details](paymentprovidervalidateenvelope-properties-data.md))

* cannot be null

* defined in: [PaymentProviderValidateEnvelope](paymentprovidervalidateenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](paymentprovidervalidateenvelope-properties-data.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PaymentProviderValidateEnvelope](paymentprovidervalidateenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
