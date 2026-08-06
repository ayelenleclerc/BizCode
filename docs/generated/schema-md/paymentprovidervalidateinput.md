# PaymentProviderValidateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PaymentProviderValidateInput.schema.json](../schema-json/PaymentProviderValidateInput.schema.json "open original schema") |

## PaymentProviderValidateInput Type

`object` ([PaymentProviderValidateInput](paymentprovidervalidateinput.md))

# PaymentProviderValidateInput Properties

| Property              | Type     | Required | Nullable       | Defined by                                                                              |
| :-------------------- | :------- | :------- | :------------- | :-------------------------------------------------------------------------------------- |
| [provider](#provider) | `string` | Required | cannot be null | [PaymentProviderValidateInput](paymentprovidercode.md "undefined#/properties/provider") |

## provider



`provider`

* is required

* Type: `string` ([PaymentProviderCode](paymentprovidercode.md))

* cannot be null

* defined in: [PaymentProviderValidateInput](paymentprovidercode.md "undefined#/properties/provider")

### provider Type

`string` ([PaymentProviderCode](paymentprovidercode.md))

### provider Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"mercadopago"` |             |
| `"payway"`      |             |
| `"stripe"`      |             |
