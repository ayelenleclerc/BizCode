# MeliDisconnectEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MeliDisconnectEnvelope.schema.json](../schema-json/MeliDisconnectEnvelope.schema.json "open original schema") |

## MeliDisconnectEnvelope Type

`object` ([MeliDisconnectEnvelope](melidisconnectenvelope.md))

# MeliDisconnectEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [MeliDisconnectEnvelope](melidisconnectenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [MeliDisconnectEnvelope](melidisconnectenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Details](melidisconnectenvelope-properties-data.md))

* cannot be null

* defined in: [MeliDisconnectEnvelope](melidisconnectenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](melidisconnectenvelope-properties-data.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MeliDisconnectEnvelope](melidisconnectenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
