# Untitled object in RepartoListEnvelope Schema

```txt
undefined#/allOf/1
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoListEnvelope.schema.json\*](../schema-json/RepartoListEnvelope.schema.json "open original schema") |

## 1 Type

`object` ([Details](repartolistenvelope-allof-1.md))

# 1 Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [RepartoListEnvelope](repartolistenvelope-allof-1-properties-data.md "undefined#/allOf/1/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [RepartoListEnvelope](repartolistenvelope-allof-1-properties-success.md "undefined#/allOf/1/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([Reparto](reparto.md))

* cannot be null

* defined in: [RepartoListEnvelope](repartolistenvelope-allof-1-properties-data.md "undefined#/allOf/1/properties/data")

### data Type

`object[]` ([Reparto](reparto.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RepartoListEnvelope](repartolistenvelope-allof-1-properties-success.md "undefined#/allOf/1/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
