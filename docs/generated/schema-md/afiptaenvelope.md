# AfipTaEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [AfipTaEnvelope.schema.json](../schema-json/AfipTaEnvelope.schema.json "open original schema") |

## AfipTaEnvelope Type

`object` ([AfipTaEnvelope](afiptaenvelope.md))

# AfipTaEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                             |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [AfipTaEnvelope](afiptaenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [AfipTaEnvelope](afiptaenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Details](afiptaenvelope-properties-data.md))

* cannot be null

* defined in: [AfipTaEnvelope](afiptaenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](afiptaenvelope-properties-data.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [AfipTaEnvelope](afiptaenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
