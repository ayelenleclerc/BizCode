# PresentacionRetencionInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PresentacionRetencionInput.schema.json](../schema-json/PresentacionRetencionInput.schema.json "open original schema") |

## PresentacionRetencionInput Type

`object` ([PresentacionRetencionInput](presentacionretencioninput.md))

# PresentacionRetencionInput Properties

| Property            | Type     | Required | Nullable       | Defined by                                                                                                     |
| :------------------ | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [formato](#formato) | `string` | Required | cannot be null | [PresentacionRetencionInput](presentacionretencioninput-properties-formato.md "undefined#/properties/formato") |
| [periodo](#periodo) | `string` | Required | cannot be null | [PresentacionRetencionInput](presentacionretencioninput-properties-periodo.md "undefined#/properties/periodo") |

## formato



`formato`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionRetencionInput](presentacionretencioninput-properties-formato.md "undefined#/properties/formato")

### formato Type

`string`

### formato Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value      | Explanation |
| :--------- | :---------- |
| `"sicore"` |             |
| `"sifere"` |             |

## periodo



`periodo`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionRetencionInput](presentacionretencioninput-properties-periodo.md "undefined#/properties/periodo")

### periodo Type

`string`

### periodo Constraints

**pattern**: the string must match the following regular expression:&#x20;

```regexp
^\\d{4}-\\d{2}$
```

[try pattern](https://regexr.com/?expression=%5E%5C%5Cd%7B4%7D-%5C%5Cd%7B2%7D%24 "try regular expression with regexr.com")
