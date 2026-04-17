# ProveedorInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ProveedorInput.schema.json](../schema-json/ProveedorInput.schema.json "open original schema") |

## ProveedorInput Type

`object` ([ProveedorInput](proveedorinput.md))

# ProveedorInput Properties

| Property              | Type      | Required | Nullable       | Defined by                                                                               |
| :-------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------- |
| [activo](#activo)     | `boolean` | Required | cannot be null | [ProveedorInput](proveedorinput-properties-activo.md "undefined#/properties/activo")     |
| [codigo](#codigo)     | `integer` | Required | cannot be null | [ProveedorInput](proveedorinput-properties-codigo.md "undefined#/properties/codigo")     |
| [condIva](#condiva)   | `string`  | Required | cannot be null | [ProveedorInput](proveedorinput-properties-condiva.md "undefined#/properties/condIva")   |
| [cuit](#cuit)         | `string`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-cuit.md "undefined#/properties/cuit")         |
| [email](#email)       | `string`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-email.md "undefined#/properties/email")       |
| [fantasia](#fantasia) | `string`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-fantasia.md "undefined#/properties/fantasia") |
| [rsocial](#rsocial)   | `string`  | Required | cannot be null | [ProveedorInput](proveedorinput-properties-rsocial.md "undefined#/properties/rsocial")   |
| [telef](#telef)       | `string`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-telef.md "undefined#/properties/telef")       |

## activo



`activo`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## codigo



`codigo`

* is required

* Type: `integer`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-codigo.md "undefined#/properties/codigo")

### codigo Type

`integer`

### codigo Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## condIva



`condIva`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-condiva.md "undefined#/properties/condIva")

### condIva Type

`string`

### condIva Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value      | Explanation |
| :--------- | :---------- |
| `"RI"`     |             |
| `"Mono"`   |             |
| `"CF"`     |             |
| `"Exento"` |             |

## cuit



`cuit`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-cuit.md "undefined#/properties/cuit")

### cuit Type

`string`

## email



`email`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-email.md "undefined#/properties/email")

### email Type

`string`

## fantasia



`fantasia`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-fantasia.md "undefined#/properties/fantasia")

### fantasia Type

`string`

## rsocial



`rsocial`

* is required

* Type: `string`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-rsocial.md "undefined#/properties/rsocial")

### rsocial Type

`string`

### rsocial Constraints

**maximum length**: the maximum number of characters for this string is: `30`

**minimum length**: the minimum number of characters for this string is: `3`

## telef



`telef`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-telef.md "undefined#/properties/telef")

### telef Type

`string`
