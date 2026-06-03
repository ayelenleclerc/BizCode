# PrintingStatusEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PrintingStatusEnvelope.schema.json](../schema-json/PrintingStatusEnvelope.schema.json "open original schema") |

## PrintingStatusEnvelope Type

`object` ([PrintingStatusEnvelope](printingstatusenvelope.md))

# PrintingStatusEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [PrintingStatusEnvelope](printingstatus.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [PrintingStatusEnvelope](printingstatusenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([PrintingStatus](printingstatus.md))

* cannot be null

* defined in: [PrintingStatusEnvelope](printingstatus.md "undefined#/properties/data")

### data Type

`object` ([PrintingStatus](printingstatus.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PrintingStatusEnvelope](printingstatusenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
