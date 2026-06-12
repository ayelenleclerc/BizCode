# PresentacionWarning Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PresentacionWarning.schema.json](../schema-json/PresentacionWarning.schema.json "open original schema") |

## PresentacionWarning Type

`object` ([PresentacionWarning](presentacionwarning.md))

# PresentacionWarning Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                               |
| :-------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [code](#code)               | `string`  | Required | cannot be null | [PresentacionWarning](presentacionwarning-properties-code.md "undefined#/properties/code")               |
| [message](#message)         | `string`  | Required | cannot be null | [PresentacionWarning](presentacionwarning-properties-message.md "undefined#/properties/message")         |
| [retencionId](#retencionid) | `integer` | Required | cannot be null | [PresentacionWarning](presentacionwarning-properties-retencionid.md "undefined#/properties/retencionId") |

## code



`code`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionWarning](presentacionwarning-properties-code.md "undefined#/properties/code")

### code Type

`string`

### code Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                     | Explanation |
| :------------------------ | :---------- |
| `"missing_cuit"`          |             |
| `"invalid_cuit"`          |             |
| `"zero_importe_excluded"` |             |

## message



`message`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionWarning](presentacionwarning-properties-message.md "undefined#/properties/message")

### message Type

`string`

## retencionId



`retencionId`

* is required

* Type: `integer`

* cannot be null

* defined in: [PresentacionWarning](presentacionwarning-properties-retencionid.md "undefined#/properties/retencionId")

### retencionId Type

`integer`

### retencionId Constraints

**minimum**: the value of this number must greater than or equal to: `1`
