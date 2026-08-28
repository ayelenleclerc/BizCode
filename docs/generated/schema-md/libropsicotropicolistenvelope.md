# LibroPsicotropicoListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LibroPsicotropicoListEnvelope.schema.json](../schema-json/LibroPsicotropicoListEnvelope.schema.json "open original schema") |

## LibroPsicotropicoListEnvelope Type

`object` ([LibroPsicotropicoListEnvelope](libropsicotropicolistenvelope.md))

# LibroPsicotropicoListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [LibroPsicotropicoListEnvelope](libropsicotropicolistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [LibroPsicotropicoListEnvelope](libropsicotropicolistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([LibroPsicotropicoMovimiento](libropsicotropicomovimiento.md))

* cannot be null

* defined in: [LibroPsicotropicoListEnvelope](libropsicotropicolistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([LibroPsicotropicoMovimiento](libropsicotropicomovimiento.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [LibroPsicotropicoListEnvelope](libropsicotropicolistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
