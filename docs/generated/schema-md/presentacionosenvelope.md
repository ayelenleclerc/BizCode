# PresentacionOSEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PresentacionOSEnvelope.schema.json](../schema-json/PresentacionOSEnvelope.schema.json "open original schema") |

## PresentacionOSEnvelope Type

`object` ([PresentacionOSEnvelope](presentacionosenvelope.md))

# PresentacionOSEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [PresentacionOSEnvelope](presentacionos.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [PresentacionOSEnvelope](presentacionosenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([PresentacionOS](presentacionos.md))

* cannot be null

* defined in: [PresentacionOSEnvelope](presentacionos.md "undefined#/properties/data")

### data Type

`object` ([PresentacionOS](presentacionos.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PresentacionOSEnvelope](presentacionosenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
