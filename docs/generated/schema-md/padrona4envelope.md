# PadronA4Envelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PadronA4Envelope.schema.json](../schema-json/PadronA4Envelope.schema.json "open original schema") |

## PadronA4Envelope Type

`object` ([PadronA4Envelope](padrona4envelope.md))

# PadronA4Envelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [PadronA4Envelope](padrona4consulta.md "undefined#/properties/data")                       |
| [success](#success) | `boolean` | Required | cannot be null | [PadronA4Envelope](padrona4envelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([PadronA4Consulta](padrona4consulta.md))

* cannot be null

* defined in: [PadronA4Envelope](padrona4consulta.md "undefined#/properties/data")

### data Type

`object` ([PadronA4Consulta](padrona4consulta.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PadronA4Envelope](padrona4envelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
