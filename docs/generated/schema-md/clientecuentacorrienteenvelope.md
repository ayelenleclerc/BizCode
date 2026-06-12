# ClienteCuentaCorrienteEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ClienteCuentaCorrienteEnvelope.schema.json](../schema-json/ClienteCuentaCorrienteEnvelope.schema.json "open original schema") |

## ClienteCuentaCorrienteEnvelope Type

`object` ([ClienteCuentaCorrienteEnvelope](clientecuentacorrienteenvelope.md))

# ClienteCuentaCorrienteEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ClienteCuentaCorrienteEnvelope](clientecuentacorriente.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ClienteCuentaCorrienteEnvelope](clientecuentacorrienteenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ClienteCuentaCorriente](clientecuentacorriente.md))

* cannot be null

* defined in: [ClienteCuentaCorrienteEnvelope](clientecuentacorriente.md "undefined#/properties/data")

### data Type

`object` ([ClienteCuentaCorriente](clientecuentacorriente.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ClienteCuentaCorrienteEnvelope](clientecuentacorrienteenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
