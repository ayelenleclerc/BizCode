# ArcaConfigEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ArcaConfigEnvelope.schema.json](../schema-json/ArcaConfigEnvelope.schema.json "open original schema") |

## ArcaConfigEnvelope Type

`object` ([ArcaConfigEnvelope](afipconfigenvelope.md))

# ArcaConfigEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ArcaConfigEnvelope](afipconfigenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [ArcaConfigEnvelope](afipconfigenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Details](afipconfigenvelope-properties-data.md))

* cannot be null

* defined in: [ArcaConfigEnvelope](afipconfigenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](afipconfigenvelope-properties-data.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ArcaConfigEnvelope](afipconfigenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
