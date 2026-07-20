# GarantiaUsoInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [GarantiaUsoInput.schema.json](../schema-json/GarantiaUsoInput.schema.json "open original schema") |

## GarantiaUsoInput Type

`object` ([GarantiaUsoInput](garantiausoinput.md))

# GarantiaUsoInput Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                         |
| :-------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [descripcion](#descripcion) | `string`  | Required | cannot be null | [GarantiaUsoInput](garantiausoinput-properties-descripcion.md "undefined#/properties/descripcion") |
| [otId](#otid)               | `integer` | Optional | cannot be null | [GarantiaUsoInput](garantiausoinput-properties-otid.md "undefined#/properties/otId")               |

## descripcion



`descripcion`

* is required

* Type: `string`

* cannot be null

* defined in: [GarantiaUsoInput](garantiausoinput-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

### descripcion Constraints

**maximum length**: the maximum number of characters for this string is: `500`

**minimum length**: the minimum number of characters for this string is: `1`

## otId



`otId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [GarantiaUsoInput](garantiausoinput-properties-otid.md "undefined#/properties/otId")

### otId Type

`integer`

### otId Constraints

**minimum**: the value of this number must greater than or equal to: `1`
