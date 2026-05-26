# LogisticaZonasListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LogisticaZonasListEnvelope.schema.json](../schema-json/LogisticaZonasListEnvelope.schema.json "open original schema") |

## LogisticaZonasListEnvelope Type

`object` ([LogisticaZonasListEnvelope](logisticazonaslistenvelope.md))

# LogisticaZonasListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [LogisticaZonasListEnvelope](logisticazonaslistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [LogisticaZonasListEnvelope](logisticazonaslistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([LogisticaZonaRow](logisticazonarow.md))

* cannot be null

* defined in: [LogisticaZonasListEnvelope](logisticazonaslistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([LogisticaZonaRow](logisticazonarow.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [LogisticaZonasListEnvelope](logisticazonaslistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
