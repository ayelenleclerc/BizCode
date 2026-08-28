# LibroPsicotropicoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LibroPsicotropicoEnvelope.schema.json](../schema-json/LibroPsicotropicoEnvelope.schema.json "open original schema") |

## LibroPsicotropicoEnvelope Type

`object` ([LibroPsicotropicoEnvelope](libropsicotropicoenvelope.md))

# LibroPsicotropicoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [LibroPsicotropicoEnvelope](libropsicotropicomovimiento.md "undefined#/properties/data")                     |
| [success](#success) | `boolean` | Required | cannot be null | [LibroPsicotropicoEnvelope](libropsicotropicoenvelope-properties-success.md "undefined#/properties/success") |

## data

Internal psychotropic book entry (#204). Internal audit trail, not the official SEDRONAR filing format.

`data`

* is required

* Type: `object` ([LibroPsicotropicoMovimiento](libropsicotropicomovimiento.md))

* cannot be null

* defined in: [LibroPsicotropicoEnvelope](libropsicotropicomovimiento.md "undefined#/properties/data")

### data Type

`object` ([LibroPsicotropicoMovimiento](libropsicotropicomovimiento.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [LibroPsicotropicoEnvelope](libropsicotropicoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
