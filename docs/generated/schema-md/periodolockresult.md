# PeriodoLockResult Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PeriodoLockResult.schema.json](../schema-json/PeriodoLockResult.schema.json "open original schema") |

## PeriodoLockResult Type

`object` ([PeriodoLockResult](periodolockresult.md))

# PeriodoLockResult Properties

| Property              | Type     | Required | Nullable       | Defined by                                                                                     |
| :-------------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [lockedAt](#lockedat) | `string` | Required | cannot be null | [PeriodoLockResult](periodolockresult-properties-lockedat.md "undefined#/properties/lockedAt") |
| [periodo](#periodo)   | `string` | Required | cannot be null | [PeriodoLockResult](periodolockresult-properties-periodo.md "undefined#/properties/periodo")   |

## lockedAt



`lockedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [PeriodoLockResult](periodolockresult-properties-lockedat.md "undefined#/properties/lockedAt")

### lockedAt Type

`string`

### lockedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## periodo



`periodo`

* is required

* Type: `string`

* cannot be null

* defined in: [PeriodoLockResult](periodolockresult-properties-periodo.md "undefined#/properties/periodo")

### periodo Type

`string`

### periodo Constraints

**pattern**: the string must match the following regular expression:&#x20;

```regexp
^\d{4}-\d{2}$
```

[try pattern](https://regexr.com/?expression=%5E%5Cd%7B4%7D-%5Cd%7B2%7D%24 "try regular expression with regexr.com")
