# CajaListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CajaListEnvelope.schema.json](../schema-json/CajaListEnvelope.schema.json "open original schema") |

## CajaListEnvelope Type

`object` ([CajaListEnvelope](cajalistenvelope.md))

# CajaListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [CajaListEnvelope](cajalistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [CajaListEnvelope](cajalistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([Caja](caja.md))

* cannot be null

* defined in: [CajaListEnvelope](cajalistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([Caja](caja.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [CajaListEnvelope](cajalistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
