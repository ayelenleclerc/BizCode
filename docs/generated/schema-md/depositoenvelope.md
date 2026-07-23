# DepositoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DepositoEnvelope.schema.json](../schema-json/DepositoEnvelope.schema.json "open original schema") |

## DepositoEnvelope Type

`object` ([DepositoEnvelope](depositoenvelope.md))

# DepositoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [DepositoEnvelope](deposito.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [DepositoEnvelope](depositoenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Deposito](deposito.md))

* cannot be null

* defined in: [DepositoEnvelope](deposito.md "undefined#/properties/data")

### data Type

`object` ([Deposito](deposito.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [DepositoEnvelope](depositoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `true` |             |
