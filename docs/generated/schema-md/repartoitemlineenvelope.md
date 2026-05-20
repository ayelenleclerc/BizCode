# RepartoItemLineEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoItemLineEnvelope.schema.json](../schema-json/RepartoItemLineEnvelope.schema.json "open original schema") |

## RepartoItemLineEnvelope Type

`object` ([RepartoItemLineEnvelope](repartoitemlineenvelope.md))

# RepartoItemLineEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [RepartoItemLineEnvelope](repartoitemline.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [RepartoItemLineEnvelope](repartoitemlineenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([RepartoItemLine](repartoitemline.md))

* cannot be null

* defined in: [RepartoItemLineEnvelope](repartoitemline.md "undefined#/properties/data")

### data Type

`object` ([RepartoItemLine](repartoitemline.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RepartoItemLineEnvelope](repartoitemlineenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
