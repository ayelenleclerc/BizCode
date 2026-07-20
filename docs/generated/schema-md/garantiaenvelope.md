# GarantiaEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [GarantiaEnvelope.schema.json](../schema-json/GarantiaEnvelope.schema.json "open original schema") |

## GarantiaEnvelope Type

`object` ([GarantiaEnvelope](garantiaenvelope.md))

# GarantiaEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [GarantiaEnvelope](garantia.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [GarantiaEnvelope](garantiaenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Garantia](garantia.md))

* cannot be null

* defined in: [GarantiaEnvelope](garantia.md "undefined#/properties/data")

### data Type

`object` ([Garantia](garantia.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [GarantiaEnvelope](garantiaenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
