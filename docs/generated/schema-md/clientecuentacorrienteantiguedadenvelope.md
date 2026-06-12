# ClienteCuentaCorrienteAntiguedadEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ClienteCuentaCorrienteAntiguedadEnvelope.schema.json](../schema-json/ClienteCuentaCorrienteAntiguedadEnvelope.schema.json "open original schema") |

## ClienteCuentaCorrienteAntiguedadEnvelope Type

`object` ([ClienteCuentaCorrienteAntiguedadEnvelope](clientecuentacorrienteantiguedadenvelope.md))

# ClienteCuentaCorrienteAntiguedadEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ClienteCuentaCorrienteAntiguedadEnvelope](clientecuentacorrienteantiguedad.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ClienteCuentaCorrienteAntiguedadEnvelope](clientecuentacorrienteantiguedadenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ClienteCuentaCorrienteAntiguedad](clientecuentacorrienteantiguedad.md))

* cannot be null

* defined in: [ClienteCuentaCorrienteAntiguedadEnvelope](clientecuentacorrienteantiguedad.md "undefined#/properties/data")

### data Type

`object` ([ClienteCuentaCorrienteAntiguedad](clientecuentacorrienteantiguedad.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ClienteCuentaCorrienteAntiguedadEnvelope](clientecuentacorrienteantiguedadenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
