# ListaPrecioEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ListaPrecioEnvelope.schema.json](../schema-json/ListaPrecioEnvelope.schema.json "open original schema") |

## ListaPrecioEnvelope Type

`object` ([ListaPrecioEnvelope](listaprecioenvelope.md))

# ListaPrecioEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ListaPrecioEnvelope](listaprecio.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ListaPrecioEnvelope](listaprecioenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ListaPrecio](listaprecio.md))

* cannot be null

* defined in: [ListaPrecioEnvelope](listaprecio.md "undefined#/properties/data")

### data Type

`object` ([ListaPrecio](listaprecio.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ListaPrecioEnvelope](listaprecioenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
