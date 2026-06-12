# PresentacionRetencionListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PresentacionRetencionListEnvelope.schema.json](../schema-json/PresentacionRetencionListEnvelope.schema.json "open original schema") |

## PresentacionRetencionListEnvelope Type

`object` ([PresentacionRetencionListEnvelope](presentacionretencionlistenvelope.md))

# PresentacionRetencionListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                   |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [PresentacionRetencionListEnvelope](presentacionretencionlistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [PresentacionRetencionListEnvelope](presentacionretencionlistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([PresentacionRetencion](presentacionretencion.md))

* cannot be null

* defined in: [PresentacionRetencionListEnvelope](presentacionretencionlistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([PresentacionRetencion](presentacionretencion.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PresentacionRetencionListEnvelope](presentacionretencionlistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
