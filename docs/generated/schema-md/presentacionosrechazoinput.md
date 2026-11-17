# PresentacionOSRechazoInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PresentacionOSRechazoInput.schema.json](../schema-json/PresentacionOSRechazoInput.schema.json "open original schema") |

## PresentacionOSRechazoInput Type

`object` ([PresentacionOSRechazoInput](presentacionosrechazoinput.md))

# PresentacionOSRechazoInput Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                                                       |
| :------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [importeRechazado](#importerechazado) | `number`  | Required | cannot be null | [PresentacionOSRechazoInput](presentacionosrechazoinput-properties-importerechazado.md "undefined#/properties/importeRechazado") |
| [motivo](#motivo)                     | `string`  | Optional | cannot be null | [PresentacionOSRechazoInput](presentacionosrechazoinput-properties-motivo.md "undefined#/properties/motivo")                     |
| [ventaConOSId](#ventaconosid)         | `integer` | Required | cannot be null | [PresentacionOSRechazoInput](presentacionosrechazoinput-properties-ventaconosid.md "undefined#/properties/ventaConOSId")         |
| [ventaOSItemId](#ventaositemid)       | `integer` | Optional | cannot be null | [PresentacionOSRechazoInput](presentacionosrechazoinput-properties-ventaositemid.md "undefined#/properties/ventaOSItemId")       |

## importeRechazado



`importeRechazado`

* is required

* Type: `number`

* cannot be null

* defined in: [PresentacionOSRechazoInput](presentacionosrechazoinput-properties-importerechazado.md "undefined#/properties/importeRechazado")

### importeRechazado Type

`number`

### importeRechazado Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`

## motivo



`motivo`

* is optional

* Type: `string`

* cannot be null

* defined in: [PresentacionOSRechazoInput](presentacionosrechazoinput-properties-motivo.md "undefined#/properties/motivo")

### motivo Type

`string`

### motivo Constraints

**maximum length**: the maximum number of characters for this string is: `300`

## ventaConOSId



`ventaConOSId`

* is required

* Type: `integer`

* cannot be null

* defined in: [PresentacionOSRechazoInput](presentacionosrechazoinput-properties-ventaconosid.md "undefined#/properties/ventaConOSId")

### ventaConOSId Type

`integer`

### ventaConOSId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## ventaOSItemId



`ventaOSItemId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [PresentacionOSRechazoInput](presentacionosrechazoinput-properties-ventaositemid.md "undefined#/properties/ventaOSItemId")

### ventaOSItemId Type

`integer`

### ventaOSItemId Constraints

**minimum**: the value of this number must greater than or equal to: `1`
