# CoberturaOSEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CoberturaOSEnvelope.schema.json](../schema-json/CoberturaOSEnvelope.schema.json "open original schema") |

## CoberturaOSEnvelope Type

`object` ([CoberturaOSEnvelope](coberturaosenvelope.md))

# CoberturaOSEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [CoberturaOSEnvelope](coberturaos.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [CoberturaOSEnvelope](coberturaosenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([CoberturaOS](coberturaos.md))

* cannot be null

* defined in: [CoberturaOSEnvelope](coberturaos.md "undefined#/properties/data")

### data Type

`object` ([CoberturaOS](coberturaos.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [CoberturaOSEnvelope](coberturaosenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
