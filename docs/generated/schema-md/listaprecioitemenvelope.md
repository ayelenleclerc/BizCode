# ListaPrecioItemEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ListaPrecioItemEnvelope.schema.json](../schema-json/ListaPrecioItemEnvelope.schema.json "open original schema") |

## ListaPrecioItemEnvelope Type

`object` ([ListaPrecioItemEnvelope](listaprecioitemenvelope.md))

# ListaPrecioItemEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ListaPrecioItemEnvelope](listaprecioitem.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ListaPrecioItemEnvelope](listaprecioitemenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ListaPrecioItem](listaprecioitem.md))

* cannot be null

* defined in: [ListaPrecioItemEnvelope](listaprecioitem.md "undefined#/properties/data")

### data Type

`object` ([ListaPrecioItem](listaprecioitem.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ListaPrecioItemEnvelope](listaprecioitemenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
