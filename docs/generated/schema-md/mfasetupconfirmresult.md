# MfaSetupConfirmResult Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MfaSetupConfirmResult.schema.json](../schema-json/MfaSetupConfirmResult.schema.json "open original schema") |

## MfaSetupConfirmResult Type

`object` ([MfaSetupConfirmResult](mfasetupconfirmresult.md))

# MfaSetupConfirmResult Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                                   |
| :-------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [backupCodes](#backupcodes) | `array`   | Required | cannot be null | [MfaSetupConfirmResult](mfasetupconfirmresult-properties-backupcodes.md "undefined#/properties/backupCodes") |
| [mfaEnabled](#mfaenabled)   | `boolean` | Required | cannot be null | [MfaSetupConfirmResult](mfasetupconfirmresult-properties-mfaenabled.md "undefined#/properties/mfaEnabled")   |

## backupCodes



`backupCodes`

* is required

* Type: `string[]`

* cannot be null

* defined in: [MfaSetupConfirmResult](mfasetupconfirmresult-properties-backupcodes.md "undefined#/properties/backupCodes")

### backupCodes Type

`string[]`

### backupCodes Constraints

**maximum number of items**: the maximum number of items for this array is: `8`

**minimum number of items**: the minimum number of items for this array is: `8`

## mfaEnabled



`mfaEnabled`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MfaSetupConfirmResult](mfasetupconfirmresult-properties-mfaenabled.md "undefined#/properties/mfaEnabled")

### mfaEnabled Type

`boolean`

### mfaEnabled Constraints

**constant**: the value of this property must be equal to:

```json
true
```
