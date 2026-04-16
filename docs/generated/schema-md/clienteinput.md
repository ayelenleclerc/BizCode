# ClienteInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ClienteInput.schema.json](../schema-json/ClienteInput.schema.json "open original schema") |

## ClienteInput Type

`object` ([ClienteInput](clienteinput.md))

# ClienteInput Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                       |
| :-------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [activo](#activo)                 | `boolean` | Required | cannot be null | [ClienteInput](clienteinput-properties-activo.md "undefined#/properties/activo")                 |
| [codigo](#codigo)                 | `integer` | Required | cannot be null | [ClienteInput](clienteinput-properties-codigo.md "undefined#/properties/codigo")                 |
| [condIva](#condiva)               | `string`  | Required | cannot be null | [ClienteInput](clienteinput-properties-condiva.md "undefined#/properties/condIva")               |
| [cpost](#cpost)                   | `string`  | Optional | cannot be null | [ClienteInput](clienteinput-properties-cpost.md "undefined#/properties/cpost")                   |
| [creditDays](#creditdays)         | `integer` | Optional | cannot be null | [ClienteInput](clienteinput-properties-creditdays.md "undefined#/properties/creditDays")         |
| [creditLimit](#creditlimit)       | `number`  | Optional | cannot be null | [ClienteInput](clienteinput-properties-creditlimit.md "undefined#/properties/creditLimit")       |
| [cuit](#cuit)                     | `string`  | Optional | cannot be null | [ClienteInput](clienteinput-properties-cuit.md "undefined#/properties/cuit")                     |
| [deliveryZoneId](#deliveryzoneid) | `integer` | Optional | cannot be null | [ClienteInput](clienteinput-properties-deliveryzoneid.md "undefined#/properties/deliveryZoneId") |
| [domicilio](#domicilio)           | `string`  | Optional | cannot be null | [ClienteInput](clienteinput-properties-domicilio.md "undefined#/properties/domicilio")           |
| [email](#email)                   | `string`  | Optional | cannot be null | [ClienteInput](clienteinput-properties-email.md "undefined#/properties/email")                   |
| [fantasia](#fantasia)             | `string`  | Optional | cannot be null | [ClienteInput](clienteinput-properties-fantasia.md "undefined#/properties/fantasia")             |
| [localidad](#localidad)           | `string`  | Optional | cannot be null | [ClienteInput](clienteinput-properties-localidad.md "undefined#/properties/localidad")           |
| [rsocial](#rsocial)               | `string`  | Required | cannot be null | [ClienteInput](clienteinput-properties-rsocial.md "undefined#/properties/rsocial")               |
| [suspended](#suspended)           | `boolean` | Optional | cannot be null | [ClienteInput](clienteinput-properties-suspended.md "undefined#/properties/suspended")           |
| [telef](#telef)                   | `string`  | Optional | cannot be null | [ClienteInput](clienteinput-properties-telef.md "undefined#/properties/telef")                   |

## activo



`activo`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ClienteInput](clienteinput-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## codigo



`codigo`

* is required

* Type: `integer`

* cannot be null

* defined in: [ClienteInput](clienteinput-properties-codigo.md "undefined#/properties/codigo")

### codigo Type

`integer`

### codigo Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## condIva



`condIva`

* is required

* Type: `string`

* cannot be null

* defined in: [ClienteInput](clienteinput-properties-condiva.md "undefined#/properties/condIva")

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

## cpost



`cpost`

* is optional

* Type: `string`

* cannot be null

* defined in: [ClienteInput](clienteinput-properties-cpost.md "undefined#/properties/cpost")

### cpost Type

`string`

### cpost Constraints

**maximum length**: the maximum number of characters for this string is: `8`

## creditDays



`creditDays`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ClienteInput](clienteinput-properties-creditdays.md "undefined#/properties/creditDays")

### creditDays Type

`integer`

### creditDays Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## creditLimit



`creditLimit`

* is optional

* Type: `number`

* cannot be null

* defined in: [ClienteInput](clienteinput-properties-creditlimit.md "undefined#/properties/creditLimit")

### creditLimit Type

`number`

## cuit



`cuit`

* is optional

* Type: `string`

* cannot be null

* defined in: [ClienteInput](clienteinput-properties-cuit.md "undefined#/properties/cuit")

### cuit Type

`string`

## deliveryZoneId



`deliveryZoneId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ClienteInput](clienteinput-properties-deliveryzoneid.md "undefined#/properties/deliveryZoneId")

### deliveryZoneId Type

`integer`

## domicilio



`domicilio`

* is optional

* Type: `string`

* cannot be null

* defined in: [ClienteInput](clienteinput-properties-domicilio.md "undefined#/properties/domicilio")

### domicilio Type

`string`

### domicilio Constraints

**maximum length**: the maximum number of characters for this string is: `40`

## email



`email`

* is optional

* Type: `string`

* cannot be null

* defined in: [ClienteInput](clienteinput-properties-email.md "undefined#/properties/email")

### email Type

`string`

### email Constraints

**email**: the string must be an email address, according to [RFC 5322, section 3.4.1](https://tools.ietf.org/html/rfc5322 "check the specification")

## fantasia



`fantasia`

* is optional

* Type: `string`

* cannot be null

* defined in: [ClienteInput](clienteinput-properties-fantasia.md "undefined#/properties/fantasia")

### fantasia Type

`string`

### fantasia Constraints

**maximum length**: the maximum number of characters for this string is: `30`

## localidad



`localidad`

* is optional

* Type: `string`

* cannot be null

* defined in: [ClienteInput](clienteinput-properties-localidad.md "undefined#/properties/localidad")

### localidad Type

`string`

### localidad Constraints

**maximum length**: the maximum number of characters for this string is: `25`

## rsocial



`rsocial`

* is required

* Type: `string`

* cannot be null

* defined in: [ClienteInput](clienteinput-properties-rsocial.md "undefined#/properties/rsocial")

### rsocial Type

`string`

### rsocial Constraints

**maximum length**: the maximum number of characters for this string is: `30`

**minimum length**: the minimum number of characters for this string is: `3`

## suspended



`suspended`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [ClienteInput](clienteinput-properties-suspended.md "undefined#/properties/suspended")

### suspended Type

`boolean`

## telef



`telef`

* is optional

* Type: `string`

* cannot be null

* defined in: [ClienteInput](clienteinput-properties-telef.md "undefined#/properties/telef")

### telef Type

`string`

### telef Constraints

**maximum length**: the maximum number of characters for this string is: `25`
