# PushTokenRegisterInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PushTokenRegisterInput.schema.json](../schema-json/PushTokenRegisterInput.schema.json "open original schema") |

## PushTokenRegisterInput Type

`object` ([PushTokenRegisterInput](pushtokenregisterinput.md))

# PushTokenRegisterInput Properties

| Property              | Type     | Required | Nullable       | Defined by                                                                                               |
| :-------------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [platform](#platform) | `string` | Optional | cannot be null | [PushTokenRegisterInput](pushtokenregisterinput-properties-platform.md "undefined#/properties/platform") |
| [token](#token)       | `string` | Required | cannot be null | [PushTokenRegisterInput](pushtokenregisterinput-properties-token.md "undefined#/properties/token")       |

## platform



`platform`

* is optional

* Type: `string`

* cannot be null

* defined in: [PushTokenRegisterInput](pushtokenregisterinput-properties-platform.md "undefined#/properties/platform")

### platform Type

`string`

### platform Constraints

**maximum length**: the maximum number of characters for this string is: `20`

## token



`token`

* is required

* Type: `string`

* cannot be null

* defined in: [PushTokenRegisterInput](pushtokenregisterinput-properties-token.md "undefined#/properties/token")

### token Type

`string`

### token Constraints

**maximum length**: the maximum number of characters for this string is: `255`

**minimum length**: the minimum number of characters for this string is: `8`
