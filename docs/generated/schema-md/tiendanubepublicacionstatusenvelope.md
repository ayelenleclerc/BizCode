# TiendanubePublicacionStatusEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TiendanubePublicacionStatusEnvelope.schema.json](../schema-json/TiendanubePublicacionStatusEnvelope.schema.json "open original schema") |

## TiendanubePublicacionStatusEnvelope Type

`object` ([TiendanubePublicacionStatusEnvelope](tiendanubepublicacionstatusenvelope.md))

# TiendanubePublicacionStatusEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [TiendanubePublicacionStatusEnvelope](tiendanubepublicacionstatus.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [TiendanubePublicacionStatusEnvelope](tiendanubepublicacionstatusenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([TiendanubePublicacionStatus](tiendanubepublicacionstatus.md))

* cannot be null

* defined in: [TiendanubePublicacionStatusEnvelope](tiendanubepublicacionstatus.md "undefined#/properties/data")

### data Type

`object` ([TiendanubePublicacionStatus](tiendanubepublicacionstatus.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [TiendanubePublicacionStatusEnvelope](tiendanubepublicacionstatusenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
