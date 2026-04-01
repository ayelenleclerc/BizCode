# RubroInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RubroInput.schema.json](../schema-json/RubroInput.schema.json "open original schema") |

## RubroInput Type

`object` ([RubroInput](rubroinput.md))

# RubroInput Properties

| Property          | Type      | Required | Nullable       | Defined by                                                                   |
| :---------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------- |
| [codigo](#codigo) | `integer` | Required | cannot be null | [RubroInput](rubroinput-properties-codigo.md "undefined#/properties/codigo") |
| [nombre](#nombre) | `string`  | Required | cannot be null | [RubroInput](rubroinput-properties-nombre.md "undefined#/properties/nombre") |

## codigo



`codigo`

* is required

* Type: `integer`

* cannot be null

* defined in: [RubroInput](rubroinput-properties-codigo.md "undefined#/properties/codigo")

### codigo Type

`integer`

### codigo Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## nombre



`nombre`

* is required

* Type: `string`

* cannot be null

* defined in: [RubroInput](rubroinput-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

### nombre Constraints

**maximum length**: the maximum number of characters for this string is: `20`
