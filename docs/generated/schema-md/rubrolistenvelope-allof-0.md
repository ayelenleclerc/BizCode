# Untitled object in RubroListEnvelope Schema

```txt
undefined#/allOf/0
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RubroListEnvelope.schema.json\*](../schema-json/RubroListEnvelope.schema.json "open original schema") |

## 0 Type

`object` ([Details](rubrolistenvelope-allof-0.md))

# 0 Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [RubroListEnvelope](rubrolistenvelope-allof-0-properties-data.md "undefined#/allOf/0/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [RubroListEnvelope](rubrolistenvelope-allof-0-properties-success.md "undefined#/allOf/0/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([Rubro](rubro.md))

* cannot be null

* defined in: [RubroListEnvelope](rubrolistenvelope-allof-0-properties-data.md "undefined#/allOf/0/properties/data")

### data Type

`object[]` ([Rubro](rubro.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RubroListEnvelope](rubrolistenvelope-allof-0-properties-success.md "undefined#/allOf/0/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
