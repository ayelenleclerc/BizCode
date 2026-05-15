# CobroEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CobroEnvelope.schema.json](../schema-json/CobroEnvelope.schema.json "open original schema") |

## CobroEnvelope Type

`object` ([CobroEnvelope](cobroenvelope.md))

# CobroEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                           |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [CobroEnvelope](cobro.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [CobroEnvelope](cobroenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Cobro](cobro.md))

* cannot be null

* defined in: [CobroEnvelope](cobro.md "undefined#/properties/data")

### data Type

`object` ([Cobro](cobro.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [CobroEnvelope](cobroenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
