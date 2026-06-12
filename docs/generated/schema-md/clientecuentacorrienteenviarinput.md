# ClienteCuentaCorrienteEnviarInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ClienteCuentaCorrienteEnviarInput.schema.json](../schema-json/ClienteCuentaCorrienteEnviarInput.schema.json "open original schema") |

## ClienteCuentaCorrienteEnviarInput Type

`object` ([ClienteCuentaCorrienteEnviarInput](clientecuentacorrienteenviarinput.md))

# ClienteCuentaCorrienteEnviarInput Properties

| Property        | Type     | Required | Nullable       | Defined by                                                                                                               |
| :-------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [desde](#desde) | `string` | Optional | cannot be null | [ClienteCuentaCorrienteEnviarInput](clientecuentacorrienteenviarinput-properties-desde.md "undefined#/properties/desde") |
| [email](#email) | `string` | Optional | cannot be null | [ClienteCuentaCorrienteEnviarInput](clientecuentacorrienteenviarinput-properties-email.md "undefined#/properties/email") |
| [hasta](#hasta) | `string` | Optional | cannot be null | [ClienteCuentaCorrienteEnviarInput](clientecuentacorrienteenviarinput-properties-hasta.md "undefined#/properties/hasta") |

## desde



`desde`

* is optional

* Type: `string`

* cannot be null

* defined in: [ClienteCuentaCorrienteEnviarInput](clientecuentacorrienteenviarinput-properties-desde.md "undefined#/properties/desde")

### desde Type

`string`

### desde Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## email



`email`

* is optional

* Type: `string`

* cannot be null

* defined in: [ClienteCuentaCorrienteEnviarInput](clientecuentacorrienteenviarinput-properties-email.md "undefined#/properties/email")

### email Type

`string`

### email Constraints

**email**: the string must be an email address, according to [RFC 5322, section 3.4.1](https://tools.ietf.org/html/rfc5322 "check the specification")

## hasta



`hasta`

* is optional

* Type: `string`

* cannot be null

* defined in: [ClienteCuentaCorrienteEnviarInput](clientecuentacorrienteenviarinput-properties-hasta.md "undefined#/properties/hasta")

### hasta Type

`string`

### hasta Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
