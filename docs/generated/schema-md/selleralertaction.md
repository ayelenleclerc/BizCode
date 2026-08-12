# SellerAlertAction Schema

```txt
undefined#/properties/sellerStockZeroAction
```



| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [SellerPoliciesPatchBody.schema.json\*](../schema-json/SellerPoliciesPatchBody.schema.json "open original schema") |

## sellerStockZeroAction Type

`string` ([SellerAlertAction](selleralertaction.md))

## sellerStockZeroAction Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value     | Explanation |
| :-------- | :---------- |
| `"warn"`  |             |
| `"block"` |             |
