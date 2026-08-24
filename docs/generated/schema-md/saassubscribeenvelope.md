# SaasSubscribeEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SaasSubscribeEnvelope.schema.json](../schema-json/SaasSubscribeEnvelope.schema.json "open original schema") |

## SaasSubscribeEnvelope Type

`object` ([SaasSubscribeEnvelope](saassubscribeenvelope.md))

# SaasSubscribeEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [SaasSubscribeEnvelope](saassubscriberesult.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [SaasSubscribeEnvelope](saassubscribeenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([SaasSubscribeResult](saassubscriberesult.md))

* cannot be null

* defined in: [SaasSubscribeEnvelope](saassubscriberesult.md "undefined#/properties/data")

### data Type

`object` ([SaasSubscribeResult](saassubscriberesult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [SaasSubscribeEnvelope](saassubscribeenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
