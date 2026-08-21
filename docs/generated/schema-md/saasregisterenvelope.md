# SaasRegisterEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SaasRegisterEnvelope.schema.json](../schema-json/SaasRegisterEnvelope.schema.json "open original schema") |

## SaasRegisterEnvelope Type

`object` ([SaasRegisterEnvelope](saasregisterenvelope.md))

# SaasRegisterEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [SaasRegisterEnvelope](saasregisterresult.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [SaasRegisterEnvelope](saasregisterenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([SaasRegisterResult](saasregisterresult.md))

* cannot be null

* defined in: [SaasRegisterEnvelope](saasregisterresult.md "undefined#/properties/data")

### data Type

`object` ([SaasRegisterResult](saasregisterresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SaasRegisterEnvelope](saasregisterenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
