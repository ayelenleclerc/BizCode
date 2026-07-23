# DepositoCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DepositoCreateInput.schema.json](../schema-json/DepositoCreateInput.schema.json "open original schema") |

## DepositoCreateInput Type

`object` ([DepositoCreateInput](depositocreateinput.md))

# DepositoCreateInput Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                   |
| :------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| [activo](#activo)               | `boolean` | Optional | cannot be null | [DepositoCreateInput](depositocreateinput-properties-activo.md "undefined#/properties/activo")               |
| [codigo](#codigo)               | `string`  | Required | cannot be null | [DepositoCreateInput](depositocreateinput-properties-codigo.md "undefined#/properties/codigo")               |
| [direccion](#direccion)         | `string`  | Optional | cannot be null | [DepositoCreateInput](depositocreateinput-properties-direccion.md "undefined#/properties/direccion")         |
| [esDefault](#esdefault)         | `boolean` | Optional | cannot be null | [DepositoCreateInput](depositocreateinput-properties-esdefault.md "undefined#/properties/esDefault")         |
| [nombre](#nombre)               | `string`  | Required | cannot be null | [DepositoCreateInput](depositocreateinput-properties-nombre.md "undefined#/properties/nombre")               |
| [responsableId](#responsableid) | `integer` | Optional | cannot be null | [DepositoCreateInput](depositocreateinput-properties-responsableid.md "undefined#/properties/responsableId") |
| [tipo](#tipo)                   | `string`  | Required | cannot be null | [DepositoCreateInput](depositocreateinput-properties-tipo.md "undefined#/properties/tipo")                   |

## activo



`activo`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [DepositoCreateInput](depositocreateinput-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## codigo



`codigo`

* is required

* Type: `string`

* cannot be null

* defined in: [DepositoCreateInput](depositocreateinput-properties-codigo.md "undefined#/properties/codigo")

### codigo Type

`string`

### codigo Constraints

**maximum length**: the maximum number of characters for this string is: `20`

## direccion



`direccion`

* is optional

* Type: `string`

* cannot be null

* defined in: [DepositoCreateInput](depositocreateinput-properties-direccion.md "undefined#/properties/direccion")

### direccion Type

`string`

### direccion Constraints

**maximum length**: the maximum number of characters for this string is: `200`

## esDefault



`esDefault`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [DepositoCreateInput](depositocreateinput-properties-esdefault.md "undefined#/properties/esDefault")

### esDefault Type

`boolean`

## nombre



`nombre`

* is required

* Type: `string`

* cannot be null

* defined in: [DepositoCreateInput](depositocreateinput-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

### nombre Constraints

**maximum length**: the maximum number of characters for this string is: `80`

## responsableId



`responsableId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [DepositoCreateInput](depositocreateinput-properties-responsableid.md "undefined#/properties/responsableId")

### responsableId Type

`integer`

### responsableId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [DepositoCreateInput](depositocreateinput-properties-tipo.md "undefined#/properties/tipo")

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
