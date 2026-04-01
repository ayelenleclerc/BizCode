# RubroEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RubroEnvelope.schema.json](../schema-json/RubroEnvelope.schema.json "open original schema") |

## RubroEnvelope Type

`object` ([RubroEnvelope](rubroenvelope.md))

# RubroEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                           |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [RubroEnvelope](rubro.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [RubroEnvelope](rubroenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Rubro](rubro.md))

* cannot be null

* defined in: [RubroEnvelope](rubro.md "undefined#/properties/data")

### data Type

`object` ([Rubro](rubro.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RubroEnvelope](rubroenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
