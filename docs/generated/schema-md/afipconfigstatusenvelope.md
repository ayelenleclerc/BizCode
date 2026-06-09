# ArcaConfigStatusEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ArcaConfigStatusEnvelope.schema.json](../schema-json/ArcaConfigStatusEnvelope.schema.json "open original schema") |

## ArcaConfigStatusEnvelope Type

`object` ([ArcaConfigStatusEnvelope](afipconfigstatusenvelope.md))

# ArcaConfigStatusEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ArcaConfigStatusEnvelope](afipconfigstatus.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ArcaConfigStatusEnvelope](afipconfigstatusenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ArcaConfigStatus](afipconfigstatus.md))

* cannot be null

* defined in: [ArcaConfigStatusEnvelope](afipconfigstatus.md "undefined#/properties/data")

### data Type

`object` ([ArcaConfigStatus](afipconfigstatus.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ArcaConfigStatusEnvelope](afipconfigstatusenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
