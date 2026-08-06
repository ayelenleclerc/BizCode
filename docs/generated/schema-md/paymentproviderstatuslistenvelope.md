# PaymentProviderStatusListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PaymentProviderStatusListEnvelope.schema.json](../schema-json/PaymentProviderStatusListEnvelope.schema.json "open original schema") |

## PaymentProviderStatusListEnvelope Type

`object` ([PaymentProviderStatusListEnvelope](paymentproviderstatuslistenvelope.md))

# PaymentProviderStatusListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [PaymentProviderStatusListEnvelope](paymentproviderstatuslistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [PaymentProviderStatusListEnvelope](paymentproviderstatuslistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([PaymentProviderStatusEntry](paymentproviderstatusentry.md))

* cannot be null

* defined in: [PaymentProviderStatusListEnvelope](paymentproviderstatuslistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([PaymentProviderStatusEntry](paymentproviderstatusentry.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PaymentProviderStatusListEnvelope](paymentproviderstatuslistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
