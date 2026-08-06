# PaymentProviderCode Schema

```txt
undefined#/properties/provider
```



| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [PaymentProviderValidateInput.schema.json\*](../schema-json/PaymentProviderValidateInput.schema.json "open original schema") |

## provider Type

`string` ([PaymentProviderCode](paymentprovidercode.md))

## provider Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"mercadopago"` |             |
| `"payway"`      |             |
| `"stripe"`      |             |
