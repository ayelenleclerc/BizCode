# RubroListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RubroListEnvelope.schema.json](../schema-json/RubroListEnvelope.schema.json "open original schema") |

## RubroListEnvelope Type

`object` ([RubroListEnvelope](rubrolistenvelope.md))

# RubroListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [RubroListEnvelope](rubrolistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [RubroListEnvelope](rubrolistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([Rubro](rubro.md))

* cannot be null

* defined in: [RubroListEnvelope](rubrolistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([Rubro](rubro.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RubroListEnvelope](rubrolistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
