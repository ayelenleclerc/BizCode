# RecuentoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RecuentoEnvelope.schema.json](../schema-json/RecuentoEnvelope.schema.json "open original schema") |

## RecuentoEnvelope Type

`object` ([RecuentoEnvelope](recuentoenvelope.md))

# RecuentoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [RecuentoEnvelope](recuento.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [RecuentoEnvelope](recuentoenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Recuento](recuento.md))

* cannot be null

* defined in: [RecuentoEnvelope](recuento.md "undefined#/properties/data")

### data Type

`object` ([Recuento](recuento.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RecuentoEnvelope](recuentoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
