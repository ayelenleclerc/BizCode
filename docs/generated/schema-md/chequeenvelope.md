# ChequeEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ChequeEnvelope.schema.json](../schema-json/ChequeEnvelope.schema.json "open original schema") |

## ChequeEnvelope Type

`object` ([ChequeEnvelope](chequeenvelope.md))

# ChequeEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                             |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ChequeEnvelope](cheque.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ChequeEnvelope](chequeenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Cheque](cheque.md))

* cannot be null

* defined in: [ChequeEnvelope](cheque.md "undefined#/properties/data")

### data Type

`object` ([Cheque](cheque.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ChequeEnvelope](chequeenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`
