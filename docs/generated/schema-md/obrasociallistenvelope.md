# ObraSocialListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ObraSocialListEnvelope.schema.json](../schema-json/ObraSocialListEnvelope.schema.json "open original schema") |

## ObraSocialListEnvelope Type

`object` ([ObraSocialListEnvelope](obrasociallistenvelope.md))

# ObraSocialListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [ObraSocialListEnvelope](obrasociallistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [ObraSocialListEnvelope](obrasociallistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([ObraSocial](obrasocial.md))

* cannot be null

* defined in: [ObraSocialListEnvelope](obrasociallistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([ObraSocial](obrasocial.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ObraSocialListEnvelope](obrasociallistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
