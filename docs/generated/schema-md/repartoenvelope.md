# RepartoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoEnvelope.schema.json](../schema-json/RepartoEnvelope.schema.json "open original schema") |

## RepartoEnvelope Type

`object` ([RepartoEnvelope](repartoenvelope.md))

# RepartoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                               |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [RepartoEnvelope](reparto.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [RepartoEnvelope](repartoenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Reparto](reparto.md))

* cannot be null

* defined in: [RepartoEnvelope](reparto.md "undefined#/properties/data")

### data Type

`object` ([Reparto](reparto.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RepartoEnvelope](repartoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
