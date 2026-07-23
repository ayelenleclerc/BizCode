# DepositoPatchInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DepositoPatchInput.schema.json](../schema-json/DepositoPatchInput.schema.json "open original schema") |

## DepositoPatchInput Type

`object` ([DepositoPatchInput](depositopatchinput.md))

# DepositoPatchInput Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                 |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [activo](#activo)               | `boolean` | Optional | cannot be null | [DepositoPatchInput](depositopatchinput-properties-activo.md "undefined#/properties/activo")               |
| [codigo](#codigo)               | `string`  | Optional | cannot be null | [DepositoPatchInput](depositopatchinput-properties-codigo.md "undefined#/properties/codigo")               |
| [direccion](#direccion)         | `string`  | Optional | cannot be null | [DepositoPatchInput](depositopatchinput-properties-direccion.md "undefined#/properties/direccion")         |
| [esDefault](#esdefault)         | `boolean` | Optional | cannot be null | [DepositoPatchInput](depositopatchinput-properties-esdefault.md "undefined#/properties/esDefault")         |
| [nombre](#nombre)               | `string`  | Optional | cannot be null | [DepositoPatchInput](depositopatchinput-properties-nombre.md "undefined#/properties/nombre")               |
| [responsableId](#responsableid) | `integer` | Optional | cannot be null | [DepositoPatchInput](depositopatchinput-properties-responsableid.md "undefined#/properties/responsableId") |
| [tipo](#tipo)                   | `string`  | Optional | cannot be null | [DepositoPatchInput](depositopatchinput-properties-tipo.md "undefined#/properties/tipo")                   |

## activo



`activo`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [DepositoPatchInput](depositopatchinput-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## codigo



`codigo`

* is optional

* Type: `string`

* cannot be null

* defined in: [DepositoPatchInput](depositopatchinput-properties-codigo.md "undefined#/properties/codigo")

### codigo Type

`string`

### codigo Constraints

**maximum length**: the maximum number of characters for this string is: `20`

## direccion



`direccion`

* is optional

* Type: `string`

* cannot be null

* defined in: [DepositoPatchInput](depositopatchinput-properties-direccion.md "undefined#/properties/direccion")

### direccion Type

`string`

## esDefault



`esDefault`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [DepositoPatchInput](depositopatchinput-properties-esdefault.md "undefined#/properties/esDefault")

### esDefault Type

`boolean`

## nombre



`nombre`

* is optional

* Type: `string`

* cannot be null

* defined in: [DepositoPatchInput](depositopatchinput-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

### nombre Constraints

**maximum length**: the maximum number of characters for this string is: `80`

## responsableId



`responsableId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [DepositoPatchInput](depositopatchinput-properties-responsableid.md "undefined#/properties/responsableId")

### responsableId Type

`integer`

## tipo



`tipo`

* is optional

* Type: `string`

* cannot be null

* defined in: [DepositoPatchInput](depositopatchinput-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"central"`  |             |
| `"sucursal"` |             |
| `"externo"`  |             |
| `"picking"`  |             |
| `"transito"` |             |
