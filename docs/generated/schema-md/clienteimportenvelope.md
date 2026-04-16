# ClienteImportEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ClienteImportEnvelope.schema.json](../schema-json/ClienteImportEnvelope.schema.json "open original schema") |

## ClienteImportEnvelope Type

`object` ([ClienteImportEnvelope](clienteimportenvelope.md))

# ClienteImportEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ClienteImportEnvelope](clienteimportresult.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [ClienteImportEnvelope](clienteimportenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ClienteImportResult](clienteimportresult.md))

* cannot be null

* defined in: [ClienteImportEnvelope](clienteimportresult.md "undefined#/properties/data")

### data Type

`object` ([ClienteImportResult](clienteimportresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ClienteImportEnvelope](clienteimportenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
