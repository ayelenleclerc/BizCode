# RepartoItemPodEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoItemPodEnvelope.schema.json](../schema-json/RepartoItemPodEnvelope.schema.json "open original schema") |

## RepartoItemPodEnvelope Type

`object` ([RepartoItemPodEnvelope](repartoitempodenvelope.md))

# RepartoItemPodEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [data](#data)       | Merged    | Required | cannot be null | [RepartoItemPodEnvelope](repartoitempod.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [RepartoItemPodEnvelope](repartoitempodenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: merged type ([RepartoItemPod](repartoitempod.md))

* cannot be null

* defined in: [RepartoItemPodEnvelope](repartoitempod.md "undefined#/properties/data")

### data Type

merged type ([RepartoItemPod](repartoitempod.md))

all of

* [RepartoItemLine](repartoitemline.md "check type definition")

* [Untitled object in RepartoItemPod](repartoitempod-allof-1.md "check type definition")

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RepartoItemPodEnvelope](repartoitempodenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
