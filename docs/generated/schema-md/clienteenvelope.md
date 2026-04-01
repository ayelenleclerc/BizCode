# ClienteEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ClienteEnvelope.schema.json](../schema-json/ClienteEnvelope.schema.json "open original schema") |

## ClienteEnvelope Type

`object` ([ClienteEnvelope](clienteenvelope.md))

# ClienteEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                               |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ClienteEnvelope](cliente.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ClienteEnvelope](clienteenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Cliente](cliente.md))

* cannot be null

* defined in: [ClienteEnvelope](cliente.md "undefined#/properties/data")

### data Type

`object` ([Cliente](cliente.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ClienteEnvelope](clienteenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
