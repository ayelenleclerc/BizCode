# MeliConfigStatusEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MeliConfigStatusEnvelope.schema.json](../schema-json/MeliConfigStatusEnvelope.schema.json "open original schema") |

## MeliConfigStatusEnvelope Type

`object` ([MeliConfigStatusEnvelope](meliconfigstatusenvelope.md))

# MeliConfigStatusEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [MeliConfigStatusEnvelope](meliconfigstatus.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [MeliConfigStatusEnvelope](meliconfigstatusenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([MeliConfigStatus](meliconfigstatus.md))

* cannot be null

* defined in: [MeliConfigStatusEnvelope](meliconfigstatus.md "undefined#/properties/data")

### data Type

`object` ([MeliConfigStatus](meliconfigstatus.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MeliConfigStatusEnvelope](meliconfigstatusenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
