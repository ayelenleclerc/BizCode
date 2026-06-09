# RepartoActivoListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RepartoActivoListEnvelope.schema.json](../schema-json/RepartoActivoListEnvelope.schema.json "open original schema") |

## RepartoActivoListEnvelope Type

`object` ([RepartoActivoListEnvelope](repartoactivolistenvelope.md))

# RepartoActivoListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [RepartoActivoListEnvelope](repartoactivolistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [RepartoActivoListEnvelope](repartoactivolistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([RepartoActivo](repartoactivo.md))

* cannot be null

* defined in: [RepartoActivoListEnvelope](repartoactivolistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([RepartoActivo](repartoactivo.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RepartoActivoListEnvelope](repartoactivolistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
