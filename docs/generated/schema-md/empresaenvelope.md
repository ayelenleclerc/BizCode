# EmpresaEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [EmpresaEnvelope.schema.json](../schema-json/EmpresaEnvelope.schema.json "open original schema") |

## EmpresaEnvelope Type

`object` ([EmpresaEnvelope](empresaenvelope.md))

# EmpresaEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                               |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [EmpresaEnvelope](empresaconfig.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [EmpresaEnvelope](empresaenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([EmpresaConfig](empresaconfig.md))

* cannot be null

* defined in: [EmpresaEnvelope](empresaconfig.md "undefined#/properties/data")

### data Type

`object` ([EmpresaConfig](empresaconfig.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [EmpresaEnvelope](empresaenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
