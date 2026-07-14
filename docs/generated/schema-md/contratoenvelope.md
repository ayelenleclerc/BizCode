# ContratoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ContratoEnvelope.schema.json](../schema-json/ContratoEnvelope.schema.json "open original schema") |

## ContratoEnvelope Type

`object` ([ContratoEnvelope](contratoenvelope.md))

# ContratoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ContratoEnvelope](contrato.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ContratoEnvelope](contratoenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Contrato](contrato.md))

* cannot be null

* defined in: [ContratoEnvelope](contrato.md "undefined#/properties/data")

### data Type

`object` ([Contrato](contrato.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ContratoEnvelope](contratoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
