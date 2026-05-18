# AfipCaeEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [AfipCaeEnvelope.schema.json](../schema-json/AfipCaeEnvelope.schema.json "open original schema") |

## AfipCaeEnvelope Type

`object` ([AfipCaeEnvelope](afipcaeenvelope.md))

# AfipCaeEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                               |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [AfipCaeEnvelope](afipcaeenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [AfipCaeEnvelope](afipcaeenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Details](afipcaeenvelope-properties-data.md))

* cannot be null

* defined in: [AfipCaeEnvelope](afipcaeenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](afipcaeenvelope-properties-data.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [AfipCaeEnvelope](afipcaeenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
