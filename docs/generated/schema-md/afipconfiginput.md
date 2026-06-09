# ArcaConfigInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ArcaConfigInput.schema.json](../schema-json/ArcaConfigInput.schema.json "open original schema") |

## ArcaConfigInput Type

`object` ([ArcaConfigInput](afipconfiginput.md))

# ArcaConfigInput Properties

| Property                    | Type     | Required | Nullable       | Defined by                                                                                       |
| :-------------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [ambiente](#ambiente)       | `string` | Optional | cannot be null | [ArcaConfigInput](afipconfiginput-properties-ambiente.md "undefined#/properties/ambiente")       |
| [certificate](#certificate) | `string` | Required | cannot be null | [ArcaConfigInput](afipconfiginput-properties-certificate.md "undefined#/properties/certificate") |
| [cuit](#cuit)               | `string` | Required | cannot be null | [ArcaConfigInput](afipconfiginput-properties-cuit.md "undefined#/properties/cuit")               |
| [privateKey](#privatekey)   | `string` | Required | cannot be null | [ArcaConfigInput](afipconfiginput-properties-privatekey.md "undefined#/properties/privateKey")   |

## ambiente



`ambiente`

* is optional

* Type: `string`

* cannot be null

* defined in: [ArcaConfigInput](afipconfiginput-properties-ambiente.md "undefined#/properties/ambiente")

### ambiente Type

`string`

### ambiente Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value            | Explanation |
| :--------------- | :---------- |
| `"homologacion"` |             |
| `"produccion"`   |             |

## certificate



`certificate`

* is required

* Type: `string`

* cannot be null

* defined in: [ArcaConfigInput](afipconfiginput-properties-certificate.md "undefined#/properties/certificate")

### certificate Type

`string`

## cuit



`cuit`

* is required

* Type: `string`

* cannot be null

* defined in: [ArcaConfigInput](afipconfiginput-properties-cuit.md "undefined#/properties/cuit")

### cuit Type

`string`

## privateKey



`privateKey`

* is required

* Type: `string`

* cannot be null

* defined in: [ArcaConfigInput](afipconfiginput-properties-privatekey.md "undefined#/properties/privateKey")

### privateKey Type

`string`
