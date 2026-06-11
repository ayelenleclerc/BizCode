# PresentacionRetencionEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PresentacionRetencionEnvelope.schema.json](../schema-json/PresentacionRetencionEnvelope.schema.json "open original schema") |

## PresentacionRetencionEnvelope Type

`object` ([PresentacionRetencionEnvelope](presentacionretencionenvelope.md))

# PresentacionRetencionEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [PresentacionRetencionEnvelope](presentacionretencion.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [PresentacionRetencionEnvelope](presentacionretencionenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([PresentacionRetencion](presentacionretencion.md))

* cannot be null

* defined in: [PresentacionRetencionEnvelope](presentacionretencion.md "undefined#/properties/data")

### data Type

`object` ([PresentacionRetencion](presentacionretencion.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PresentacionRetencionEnvelope](presentacionretencionenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
