# SaasBillingListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SaasBillingListEnvelope.schema.json](../schema-json/SaasBillingListEnvelope.schema.json "open original schema") |

## SaasBillingListEnvelope Type

`object` ([SaasBillingListEnvelope](saasbillinglistenvelope.md))

# SaasBillingListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [SaasBillingListEnvelope](saasbillinglist.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [SaasBillingListEnvelope](saasbillinglistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([SaasBillingList](saasbillinglist.md))

* cannot be null

* defined in: [SaasBillingListEnvelope](saasbillinglist.md "undefined#/properties/data")

### data Type

`object` ([SaasBillingList](saasbillinglist.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SaasBillingListEnvelope](saasbillinglistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
