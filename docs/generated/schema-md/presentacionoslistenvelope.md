# PresentacionOSListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PresentacionOSListEnvelope.schema.json](../schema-json/PresentacionOSListEnvelope.schema.json "open original schema") |

## PresentacionOSListEnvelope Type

`object` ([PresentacionOSListEnvelope](presentacionoslistenvelope.md))

# PresentacionOSListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [PresentacionOSListEnvelope](presentacionoslistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [PresentacionOSListEnvelope](presentacionoslistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([PresentacionOS](presentacionos.md))

* cannot be null

* defined in: [PresentacionOSListEnvelope](presentacionoslistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([PresentacionOS](presentacionos.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PresentacionOSListEnvelope](presentacionoslistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
