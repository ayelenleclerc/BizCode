# SellerPolicies Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SellerPoliciesEnvelope.schema.json\*](../schema-json/SellerPoliciesEnvelope.schema.json "open original schema") |

## data Type

`object` ([SellerPolicies](sellerpolicies.md))

# data Properties

| Property                                                      | Type      | Required | Nullable       | Defined by                                                                                                                       |
| :------------------------------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [sellerCreditOverLimitAction](#sellercreditoverlimitaction)   | `string`  | Required | cannot be null | [SellerPolicies](selleralertaction.md "undefined#/properties/sellerCreditOverLimitAction")                                       |
| [sellerCreditOverdueAction](#sellercreditoverdueaction)       | `string`  | Required | cannot be null | [SellerPolicies](selleralertaction.md "undefined#/properties/sellerCreditOverdueAction")                                         |
| [sellerStockCapQtyToAvailable](#sellerstockcapqtytoavailable) | `boolean` | Required | cannot be null | [SellerPolicies](sellerpolicies-properties-sellerstockcapqtytoavailable.md "undefined#/properties/sellerStockCapQtyToAvailable") |
| [sellerStockZeroAction](#sellerstockzeroaction)               | `string`  | Required | cannot be null | [SellerPolicies](selleralertaction.md "undefined#/properties/sellerStockZeroAction")                                             |

## sellerCreditOverLimitAction



`sellerCreditOverLimitAction`

* is required

* Type: `string` ([SellerAlertAction](selleralertaction.md))

* cannot be null

* defined in: [SellerPolicies](selleralertaction.md "undefined#/properties/sellerCreditOverLimitAction")

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

* is required

* Type: `string` ([SellerAlertAction](selleralertaction.md))

* cannot be null

* defined in: [SellerPolicies](selleralertaction.md "undefined#/properties/sellerCreditOverdueAction")

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

* is required

* Type: `boolean`

* cannot be null

* defined in: [SellerPolicies](sellerpolicies-properties-sellerstockcapqtytoavailable.md "undefined#/properties/sellerStockCapQtyToAvailable")

### sellerStockCapQtyToAvailable Type

`boolean`

## sellerStockZeroAction



`sellerStockZeroAction`

* is required

* Type: `string` ([SellerAlertAction](selleralertaction.md))

* cannot be null

* defined in: [SellerPolicies](selleralertaction.md "undefined#/properties/sellerStockZeroAction")

### sellerStockZeroAction Type

`string` ([SellerAlertAction](selleralertaction.md))

### sellerStockZeroAction Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value     | Explanation |
| :-------- | :---------- |
| `"warn"`  |             |
| `"block"` |             |
