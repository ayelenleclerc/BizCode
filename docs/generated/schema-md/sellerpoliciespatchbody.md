# SellerPoliciesPatchBody Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Forbidden             | none                | [SellerPoliciesPatchBody.schema.json](../schema-json/SellerPoliciesPatchBody.schema.json "open original schema") |

## SellerPoliciesPatchBody Type

`object` ([SellerPoliciesPatchBody](sellerpoliciespatchbody.md))

# SellerPoliciesPatchBody Properties

| Property                                                      | Type      | Required | Nullable       | Defined by                                                                                                                                         |
| :------------------------------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| [sellerCreditOverLimitAction](#sellercreditoverlimitaction)   | `string`  | Optional | cannot be null | [SellerPoliciesPatchBody](selleralertaction.md "undefined#/properties/sellerCreditOverLimitAction")                                                |
| [sellerCreditOverdueAction](#sellercreditoverdueaction)       | `string`  | Optional | cannot be null | [SellerPoliciesPatchBody](selleralertaction.md "undefined#/properties/sellerCreditOverdueAction")                                                  |
| [sellerStockCapQtyToAvailable](#sellerstockcapqtytoavailable) | `boolean` | Optional | cannot be null | [SellerPoliciesPatchBody](sellerpoliciespatchbody-properties-sellerstockcapqtytoavailable.md "undefined#/properties/sellerStockCapQtyToAvailable") |
| [sellerStockZeroAction](#sellerstockzeroaction)               | `string`  | Optional | cannot be null | [SellerPoliciesPatchBody](selleralertaction.md "undefined#/properties/sellerStockZeroAction")                                                      |

## sellerCreditOverLimitAction



`sellerCreditOverLimitAction`

* is optional

* Type: `string` ([SellerAlertAction](selleralertaction.md))

* cannot be null

* defined in: [SellerPoliciesPatchBody](selleralertaction.md "undefined#/properties/sellerCreditOverLimitAction")

### sellerCreditOverLimitAction Type

`string` ([SellerAlertAction](selleralertaction.md))

### sellerCreditOverLimitAction Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value     | Explanation |
| :-------- | :---------- |
| `"warn"`  |             |
| `"block"` |             |

## sellerCreditOverdueAction



`sellerCreditOverdueAction`

* is optional

* Type: `string` ([SellerAlertAction](selleralertaction.md))

* cannot be null

* defined in: [SellerPoliciesPatchBody](selleralertaction.md "undefined#/properties/sellerCreditOverdueAction")

### sellerCreditOverdueAction Type

`string` ([SellerAlertAction](selleralertaction.md))

### sellerCreditOverdueAction Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value     | Explanation |
| :-------- | :---------- |
| `"warn"`  |             |
| `"block"` |             |

## sellerStockCapQtyToAvailable



`sellerStockCapQtyToAvailable`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [SellerPoliciesPatchBody](sellerpoliciespatchbody-properties-sellerstockcapqtytoavailable.md "undefined#/properties/sellerStockCapQtyToAvailable")

### sellerStockCapQtyToAvailable Type

`boolean`

## sellerStockZeroAction



`sellerStockZeroAction`

* is optional

* Type: `string` ([SellerAlertAction](selleralertaction.md))

* cannot be null

* defined in: [SellerPoliciesPatchBody](selleralertaction.md "undefined#/properties/sellerStockZeroAction")

### sellerStockZeroAction Type

`string` ([SellerAlertAction](selleralertaction.md))

### sellerStockZeroAction Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value     | Explanation |
| :-------- | :---------- |
| `"warn"`  |             |
| `"block"` |             |
