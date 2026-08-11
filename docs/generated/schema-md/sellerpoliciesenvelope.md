# SellerPoliciesEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SellerPoliciesEnvelope.schema.json](../schema-json/SellerPoliciesEnvelope.schema.json "open original schema") |

## SellerPoliciesEnvelope Type

`object` ([SellerPoliciesEnvelope](sellerpoliciesenvelope.md))

# SellerPoliciesEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [SellerPoliciesEnvelope](sellerpolicies.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [SellerPoliciesEnvelope](sellerpoliciesenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([SellerPolicies](sellerpolicies.md))

* cannot be null

* defined in: [SellerPoliciesEnvelope](sellerpolicies.md "undefined#/properties/data")

### data Type

`object` ([SellerPolicies](sellerpolicies.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SellerPoliciesEnvelope](sellerpoliciesenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
