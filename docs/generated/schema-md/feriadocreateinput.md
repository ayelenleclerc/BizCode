# FeriadoCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FeriadoCreateInput.schema.json](../schema-json/FeriadoCreateInput.schema.json "open original schema") |

## FeriadoCreateInput Type

`object` ([FeriadoCreateInput](feriadocreateinput.md))

# FeriadoCreateInput Properties

| Property                | Type     | Required | Nullable       | Defined by                                                                                         |
| :---------------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [fecha](#fecha)         | `string` | Required | cannot be null | [FeriadoCreateInput](feriadocreateinput-properties-fecha.md "undefined#/properties/fecha")         |
| [nombre](#nombre)       | `string` | Required | cannot be null | [FeriadoCreateInput](feriadocreateinput-properties-nombre.md "undefined#/properties/nombre")       |
| [provincia](#provincia) | `string` | Optional | cannot be null | [FeriadoCreateInput](feriadocreateinput-properties-provincia.md "undefined#/properties/provincia") |
| [tipo](#tipo)           | `string` | Optional | cannot be null | [FeriadoCreateInput](feriadotipo.md "undefined#/properties/tipo")                                  |

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [FeriadoCreateInput](feriadocreateinput-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## nombre



`nombre`

* is required

* Type: `string`

* cannot be null

* defined in: [FeriadoCreateInput](feriadocreateinput-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

### nombre Constraints

**maximum length**: the maximum number of characters for this string is: `120`

## provincia



`provincia`

* is optional

* Type: `string`

* cannot be null

* defined in: [FeriadoCreateInput](feriadocreateinput-properties-provincia.md "undefined#/properties/provincia")

### provincia Type

`string`

## tipo



`tipo`

* is optional

* Type: `string` ([FeriadoTipo](feriadotipo.md))

* cannot be null

* defined in: [FeriadoCreateInput](feriadotipo.md "undefined#/properties/tipo")

### tipo Type

`string` ([FeriadoTipo](feriadotipo.md))

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"nacional"`   |             |
| `"provincial"` |             |
| `"local"`      |             |
