# PaymentProviderFlagsEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PaymentProviderFlagsEnvelope.schema.json](../schema-json/PaymentProviderFlagsEnvelope.schema.json "open original schema") |

## PaymentProviderFlagsEnvelope Type

`object` ([PaymentProviderFlagsEnvelope](paymentproviderflagsenvelope.md))

# PaymentProviderFlagsEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | Merged    | Optional | cannot be null | [PaymentProviderFlagsEnvelope](paymentproviderflagsenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [PaymentProviderFlagsEnvelope](paymentproviderflagsenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is optional

* Type: merged type ([Details](paymentproviderflagsenvelope-properties-data.md))

* cannot be null

* defined in: [PaymentProviderFlagsEnvelope](paymentproviderflagsenvelope-properties-data.md "undefined#/properties/data")

### data Type

merged type ([Details](paymentproviderflagsenvelope-properties-data.md))

one (and only one) of

* [PaymentProviderStatusEntry](paymentproviderstatusentry.md "check type definition")

* [Untitled null in PaymentProviderFlagsEnvelope](paymentproviderflagsenvelope-properties-data-oneof-1.md "check type definition")

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PaymentProviderFlagsEnvelope](paymentproviderflagsenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
