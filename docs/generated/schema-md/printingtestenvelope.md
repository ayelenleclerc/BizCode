# PrintingTestEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PrintingTestEnvelope.schema.json](../schema-json/PrintingTestEnvelope.schema.json "open original schema") |

## PrintingTestEnvelope Type

`object` ([PrintingTestEnvelope](printingtestenvelope.md))

# PrintingTestEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [PrintingTestEnvelope](printingtestresult.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [PrintingTestEnvelope](printingtestenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([PrintingTestResult](printingtestresult.md))

* cannot be null

* defined in: [PrintingTestEnvelope](printingtestresult.md "undefined#/properties/data")

### data Type

`object` ([PrintingTestResult](printingtestresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PrintingTestEnvelope](printingtestenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
