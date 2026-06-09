# LogisticaKpisEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LogisticaKpisEnvelope.schema.json](../schema-json/LogisticaKpisEnvelope.schema.json "open original schema") |

## LogisticaKpisEnvelope Type

`object` ([LogisticaKpisEnvelope](logisticakpisenvelope.md))

# LogisticaKpisEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [LogisticaKpisEnvelope](logisticakpis.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [LogisticaKpisEnvelope](logisticakpisenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([LogisticaKpis](logisticakpis.md))

* cannot be null

* defined in: [LogisticaKpisEnvelope](logisticakpis.md "undefined#/properties/data")

### data Type

`object` ([LogisticaKpis](logisticakpis.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [LogisticaKpisEnvelope](logisticakpisenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
