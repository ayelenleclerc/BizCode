# MfaVerifyInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MfaVerifyInput.schema.json](../schema-json/MfaVerifyInput.schema.json "open original schema") |

## MfaVerifyInput Type

`object` ([MfaVerifyInput](mfaverifyinput.md))

# MfaVerifyInput Properties

| Property              | Type     | Required | Nullable       | Defined by                                                                               |
| :-------------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------- |
| [code](#code)         | `string` | Required | cannot be null | [MfaVerifyInput](mfaverifyinput-properties-code.md "undefined#/properties/code")         |
| [mfaToken](#mfatoken) | `string` | Required | cannot be null | [MfaVerifyInput](mfaverifyinput-properties-mfatoken.md "undefined#/properties/mfaToken") |

## code

6-digit TOTP or single-use backup code

`code`

* is required

* Type: `string`

* cannot be null

* defined in: [MfaVerifyInput](mfaverifyinput-properties-code.md "undefined#/properties/code")

### code Type

`string`

## mfaToken



`mfaToken`

* is required

* Type: `string`

* cannot be null

* defined in: [MfaVerifyInput](mfaverifyinput-properties-mfatoken.md "undefined#/properties/mfaToken")

### mfaToken Type

`string`
