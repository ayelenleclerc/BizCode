# MfaSetupStartResult Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MfaSetupStartResult.schema.json](../schema-json/MfaSetupStartResult.schema.json "open original schema") |

## MfaSetupStartResult Type

`object` ([MfaSetupStartResult](mfasetupstartresult.md))

# MfaSetupStartResult Properties

| Property                  | Type     | Required | Nullable       | Defined by                                                                                             |
| :------------------------ | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [otpauthUrl](#otpauthurl) | `string` | Required | cannot be null | [MfaSetupStartResult](mfasetupstartresult-properties-otpauthurl.md "undefined#/properties/otpauthUrl") |
| [qrDataUrl](#qrdataurl)   | `string` | Required | cannot be null | [MfaSetupStartResult](mfasetupstartresult-properties-qrdataurl.md "undefined#/properties/qrDataUrl")   |
| [secret](#secret)         | `string` | Required | cannot be null | [MfaSetupStartResult](mfasetupstartresult-properties-secret.md "undefined#/properties/secret")         |

## otpauthUrl



`otpauthUrl`

* is required

* Type: `string`

* cannot be null

* defined in: [MfaSetupStartResult](mfasetupstartresult-properties-otpauthurl.md "undefined#/properties/otpauthUrl")

### otpauthUrl Type

`string`

## qrDataUrl

PNG data URL for QR

`qrDataUrl`

* is required

* Type: `string`

* cannot be null

* defined in: [MfaSetupStartResult](mfasetupstartresult-properties-qrdataurl.md "undefined#/properties/qrDataUrl")

### qrDataUrl Type

`string`

## secret

Base32 secret for manual entry

`secret`

* is required

* Type: `string`

* cannot be null

* defined in: [MfaSetupStartResult](mfasetupstartresult-properties-secret.md "undefined#/properties/secret")

### secret Type

`string`
