# ClienteCuentaCorrienteSaldoEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ClienteCuentaCorrienteSaldoEnvelope.schema.json](../schema-json/ClienteCuentaCorrienteSaldoEnvelope.schema.json "open original schema") |

## ClienteCuentaCorrienteSaldoEnvelope Type

`object` ([ClienteCuentaCorrienteSaldoEnvelope](clientecuentacorrientesaldoenvelope.md))

# ClienteCuentaCorrienteSaldoEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ClienteCuentaCorrienteSaldoEnvelope](clientecuentacorrientesaldo.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ClienteCuentaCorrienteSaldoEnvelope](clientecuentacorrientesaldoenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ClienteCuentaCorrienteSaldo](clientecuentacorrientesaldo.md))

* cannot be null

* defined in: [ClienteCuentaCorrienteSaldoEnvelope](clientecuentacorrientesaldo.md "undefined#/properties/data")

### data Type

`object` ([ClienteCuentaCorrienteSaldo](clientecuentacorrientesaldo.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ClienteCuentaCorrienteSaldoEnvelope](clientecuentacorrientesaldoenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
