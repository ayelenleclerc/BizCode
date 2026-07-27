# RefreshEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RefreshEnvelope.schema.json](../schema-json/RefreshEnvelope.schema.json "open original schema") |

## RefreshEnvelope Type

`object` ([RefreshEnvelope](refreshenvelope.md))

# RefreshEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                               |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [RefreshEnvelope](refreshresult.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [RefreshEnvelope](refreshenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([RefreshResult](refreshresult.md))

* cannot be null

* defined in: [RefreshEnvelope](refreshresult.md "undefined#/properties/data")

### data Type

`object` ([RefreshResult](refreshresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RefreshEnvelope](refreshenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
