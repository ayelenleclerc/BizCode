# FefoAllocationListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FefoAllocationListEnvelope.schema.json](../schema-json/FefoAllocationListEnvelope.schema.json "open original schema") |

## FefoAllocationListEnvelope Type

`object` ([FefoAllocationListEnvelope](fefoallocationlistenvelope.md))

# FefoAllocationListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [FefoAllocationListEnvelope](fefoallocationlistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [FefoAllocationListEnvelope](fefoallocationlistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([FefoAllocation](fefoallocation.md))

* cannot be null

* defined in: [FefoAllocationListEnvelope](fefoallocationlistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([FefoAllocation](fefoallocation.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FefoAllocationListEnvelope](fefoallocationlistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
