# PresentacionOSCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PresentacionOSCreateInput.schema.json](../schema-json/PresentacionOSCreateInput.schema.json "open original schema") |

## PresentacionOSCreateInput Type

`object` ([PresentacionOSCreateInput](presentacionoscreateinput.md))

# PresentacionOSCreateInput Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                                                             |
| :---------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [obraSocialId](#obrasocialid) | `integer` | Required | cannot be null | [PresentacionOSCreateInput](presentacionoscreateinput-properties-obrasocialid.md "undefined#/properties/obraSocialId") |
| [periodo](#periodo)           | `string`  | Required | cannot be null | [PresentacionOSCreateInput](presentacionoscreateinput-properties-periodo.md "undefined#/properties/periodo")           |

## obraSocialId



`obraSocialId`

* is required

* Type: `integer`

* cannot be null

* defined in: [PresentacionOSCreateInput](presentacionoscreateinput-properties-obrasocialid.md "undefined#/properties/obraSocialId")

### obraSocialId Type

`integer`

### obraSocialId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## periodo



`periodo`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionOSCreateInput](presentacionoscreateinput-properties-periodo.md "undefined#/properties/periodo")

### periodo Type

`string`

### periodo Constraints

**pattern**: the string must match the following regular expression:&#x20;

```regexp
^\d{4}-(0[1-9]|1[0-2])$
```

[try pattern](https://regexr.com/?expression=%5E%5Cd%7B4%7D-\(0%5B1-9%5D%7C1%5B0-2%5D\)%24 "try regular expression with regexr.com")
