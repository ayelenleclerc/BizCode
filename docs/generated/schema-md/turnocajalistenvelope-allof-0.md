# Untitled object in TurnoCajaListEnvelope Schema

```txt
undefined#/allOf/0
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TurnoCajaListEnvelope.schema.json\*](../schema-json/TurnoCajaListEnvelope.schema.json "open original schema") |

## 0 Type

`object` ([Details](turnocajalistenvelope-allof-0.md))

# 0 Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [counts](#counts)   | `object`  | Optional | cannot be null | [TurnoCajaListEnvelope](turnocajalistenvelope-allof-0-properties-counts.md "undefined#/allOf/0/properties/counts")   |
| [data](#data)       | `array`   | Required | cannot be null | [TurnoCajaListEnvelope](turnocajalistenvelope-allof-0-properties-data.md "undefined#/allOf/0/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [TurnoCajaListEnvelope](turnocajalistenvelope-allof-0-properties-success.md "undefined#/allOf/0/properties/success") |

## counts



`counts`

* is optional

* Type: `object` ([Details](turnocajalistenvelope-allof-0-properties-counts.md))

* cannot be null

* defined in: [TurnoCajaListEnvelope](turnocajalistenvelope-allof-0-properties-counts.md "undefined#/allOf/0/properties/counts")

### counts Type

`object` ([Details](turnocajalistenvelope-allof-0-properties-counts.md))

## data



`data`

* is required

* Type: `object[]` ([TurnoCaja](turnocaja.md))

* cannot be null

* defined in: [TurnoCajaListEnvelope](turnocajalistenvelope-allof-0-properties-data.md "undefined#/allOf/0/properties/data")

### data Type

`object[]` ([TurnoCaja](turnocaja.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [TurnoCajaListEnvelope](turnocajalistenvelope-allof-0-properties-success.md "undefined#/allOf/0/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
