# OrdenEntregaEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenEntregaEnvelope.schema.json](../schema-json/OrdenEntregaEnvelope.schema.json "open original schema") |

## OrdenEntregaEnvelope Type

`object` ([OrdenEntregaEnvelope](ordenentregaenvelope.md))

# OrdenEntregaEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [OrdenEntregaEnvelope](ordenentrega.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [OrdenEntregaEnvelope](ordenentregaenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([OrdenEntrega](ordenentrega.md))

* cannot be null

* defined in: [OrdenEntregaEnvelope](ordenentrega.md "undefined#/properties/data")

### data Type

`object` ([OrdenEntrega](ordenentrega.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [OrdenEntregaEnvelope](ordenentregaenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
