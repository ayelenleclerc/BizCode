# ChangePasswordInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ChangePasswordInput.schema.json](../schema-json/ChangePasswordInput.schema.json "open original schema") |

## ChangePasswordInput Type

`object` ([ChangePasswordInput](changepasswordinput.md))

# ChangePasswordInput Properties

| Property                            | Type     | Required | Nullable       | Defined by                                                                                                       |
| :---------------------------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [currentPassword](#currentpassword) | `string` | Required | cannot be null | [ChangePasswordInput](changepasswordinput-properties-currentpassword.md "undefined#/properties/currentPassword") |
| [newPassword](#newpassword)         | `string` | Required | cannot be null | [ChangePasswordInput](changepasswordinput-properties-newpassword.md "undefined#/properties/newPassword")         |

## currentPassword



`currentPassword`

* is required

* Type: `string`

* cannot be null

* defined in: [ChangePasswordInput](changepasswordinput-properties-currentpassword.md "undefined#/properties/currentPassword")

### currentPassword Type

`string`

## newPassword



`newPassword`

* is required

* Type: `string`

* cannot be null

* defined in: [ChangePasswordInput](changepasswordinput-properties-newpassword.md "undefined#/properties/newPassword")

### newPassword Type

`string`

### newPassword Constraints

**minimum length**: the minimum number of characters for this string is: `8`
