# MfaAdminDisableInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MfaAdminDisableInput.schema.json](../schema-json/MfaAdminDisableInput.schema.json "open original schema") |

## MfaAdminDisableInput Type

`object` ([MfaAdminDisableInput](mfaadmindisableinput.md))

# MfaAdminDisableInput Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [code](#code)       | `string`  | Optional | cannot be null | [MfaAdminDisableInput](mfaadmindisableinput-properties-code.md "undefined#/properties/code")       |
| [enabled](#enabled) | `boolean` | Required | cannot be null | [MfaAdminDisableInput](mfaadmindisableinput-properties-enabled.md "undefined#/properties/enabled") |

## code

Required when the caller has MFA enabled

`code`

* is optional

* Type: `string`

* cannot be null

* defined in: [MfaAdminDisableInput](mfaadmindisableinput-properties-code.md "undefined#/properties/code")

### code Type

`string`

## enabled



`enabled`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MfaAdminDisableInput](mfaadmindisableinput-properties-enabled.md "undefined#/properties/enabled")

### enabled Type

`boolean`

### enabled Constraints

**constant**: the value of this property must be equal to:

```json
false
```
