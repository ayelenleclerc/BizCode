# AfipConfigInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [AfipConfigInput.schema.json](../schema-json/AfipConfigInput.schema.json "open original schema") |

## AfipConfigInput Type

`object` ([AfipConfigInput](afipconfiginput.md))

# AfipConfigInput Properties

| Property                    | Type     | Required | Nullable       | Defined by                                                                                       |
| :-------------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [ambiente](#ambiente)       | `string` | Optional | cannot be null | [AfipConfigInput](afipconfiginput-properties-ambiente.md "undefined#/properties/ambiente")       |
| [certificate](#certificate) | `string` | Required | cannot be null | [AfipConfigInput](afipconfiginput-properties-certificate.md "undefined#/properties/certificate") |
| [cuit](#cuit)               | `string` | Required | cannot be null | [AfipConfigInput](afipconfiginput-properties-cuit.md "undefined#/properties/cuit")               |
| [privateKey](#privatekey)   | `string` | Required | cannot be null | [AfipConfigInput](afipconfiginput-properties-privatekey.md "undefined#/properties/privateKey")   |

## ambiente



`ambiente`

* is optional

* Type: `string`

* cannot be null

* defined in: [AfipConfigInput](afipconfiginput-properties-ambiente.md "undefined#/properties/ambiente")

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

* defined in: [AfipConfigInput](afipconfiginput-properties-certificate.md "undefined#/properties/certificate")

### certificate Type

`string`

## cuit



`cuit`

* is required

* Type: `string`

* cannot be null

* defined in: [AfipConfigInput](afipconfiginput-properties-cuit.md "undefined#/properties/cuit")

### cuit Type

`string`

## privateKey



`privateKey`

* is required

* Type: `string`

* cannot be null

* defined in: [AfipConfigInput](afipconfiginput-properties-privatekey.md "undefined#/properties/privateKey")

### privateKey Type

`string`
