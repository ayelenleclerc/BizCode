# TiendanubeConfigStatusEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TiendanubeConfigStatusEnvelope.schema.json](../schema-json/TiendanubeConfigStatusEnvelope.schema.json "open original schema") |

## TiendanubeConfigStatusEnvelope Type

`object` ([TiendanubeConfigStatusEnvelope](tiendanubeconfigstatusenvelope.md))

# TiendanubeConfigStatusEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [TiendanubeConfigStatusEnvelope](tiendanubeconfigstatus.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [TiendanubeConfigStatusEnvelope](tiendanubeconfigstatusenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([TiendanubeConfigStatus](tiendanubeconfigstatus.md))

* cannot be null

* defined in: [TiendanubeConfigStatusEnvelope](tiendanubeconfigstatus.md "undefined#/properties/data")

### data Type

`object` ([TiendanubeConfigStatus](tiendanubeconfigstatus.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [TiendanubeConfigStatusEnvelope](tiendanubeconfigstatusenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
