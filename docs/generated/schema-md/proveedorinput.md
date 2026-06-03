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

| Property                          | Type      | Required | Nullable       | Defined by                                                                                           |
| :-------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [activo](#activo)                 | `boolean` | Required | cannot be null | [ProveedorInput](proveedorinput-properties-activo.md "undefined#/properties/activo")                 |
| [alias](#alias)                   | `string`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-alias.md "undefined#/properties/alias")                   |
| [banco](#banco)                   | `string`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-banco.md "undefined#/properties/banco")                   |
| [categoria](#categoria)           | `string`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-categoria.md "undefined#/properties/categoria")           |
| [cbu](#cbu)                       | `string`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-cbu.md "undefined#/properties/cbu")                       |
| [codigo](#codigo)                 | `integer` | Required | cannot be null | [ProveedorInput](proveedorinput-properties-codigo.md "undefined#/properties/codigo")                 |
| [condIva](#condiva)               | `string`  | Required | cannot be null | [ProveedorInput](proveedorinput-properties-condiva.md "undefined#/properties/condIva")               |
| [condicionPago](#condicionpago)   | `string`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-condicionpago.md "undefined#/properties/condicionPago")   |
| [contactoEmail](#contactoemail)   | `string`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-contactoemail.md "undefined#/properties/contactoEmail")   |
| [contactoNombre](#contactonombre) | `string`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-contactonombre.md "undefined#/properties/contactoNombre") |
| [contactoTel](#contactotel)       | `string`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-contactotel.md "undefined#/properties/contactoTel")       |
| [cuit](#cuit)                     | `string`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-cuit.md "undefined#/properties/cuit")                     |
| [descuentoPct](#descuentopct)     | `number`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-descuentopct.md "undefined#/properties/descuentoPct")     |
| [email](#email)                   | `string`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-email.md "undefined#/properties/email")                   |
| [fantasia](#fantasia)             | `string`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-fantasia.md "undefined#/properties/fantasia")             |
| [limiteCredito](#limitecredito)   | `number`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-limitecredito.md "undefined#/properties/limiteCredito")   |
| [moneda](#moneda)                 | `string`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-moneda.md "undefined#/properties/moneda")                 |
| [notas](#notas)                   | `string`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-notas.md "undefined#/properties/notas")                   |
| [plazoHabitual](#plazohabitual)   | `integer` | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-plazohabitual.md "undefined#/properties/plazoHabitual")   |
| [rsocial](#rsocial)               | `string`  | Required | cannot be null | [ProveedorInput](proveedorinput-properties-rsocial.md "undefined#/properties/rsocial")               |
| [telef](#telef)                   | `string`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-telef.md "undefined#/properties/telef")                   |
| [tipoCuenta](#tipocuenta)         | `string`  | Optional | cannot be null | [ProveedorInput](proveedorinput-properties-tipocuenta.md "undefined#/properties/tipoCuenta")         |

## activo



`activo`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## alias



`alias`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-alias.md "undefined#/properties/alias")

### alias Type

`string`

## banco



`banco`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-banco.md "undefined#/properties/banco")

### banco Type

`string`

## categoria



`categoria`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-categoria.md "undefined#/properties/categoria")

### categoria Type

`string`

### categoria Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value             | Explanation |
| :---------------- | :---------- |
| `"materia_prima"` |             |
| `"insumos"`       |             |
| `"servicios"`     |             |
| `"logistica"`     |             |

## cbu



`cbu`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-cbu.md "undefined#/properties/cbu")

### cbu Type

`string`

### cbu Constraints

**maximum length**: the maximum number of characters for this string is: `22`

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

## condicionPago



`condicionPago`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-condicionpago.md "undefined#/properties/condicionPago")

### condicionPago Type

`string`

### condicionPago Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"contado"` |             |
| `"15dias"`  |             |
| `"30dias"`  |             |
| `"60dias"`  |             |
| `"otro"`    |             |

## contactoEmail



`contactoEmail`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-contactoemail.md "undefined#/properties/contactoEmail")

### contactoEmail Type

`string`

## contactoNombre



`contactoNombre`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-contactonombre.md "undefined#/properties/contactoNombre")

### contactoNombre Type

`string`

## contactoTel



`contactoTel`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-contactotel.md "undefined#/properties/contactoTel")

### contactoTel Type

`string`

## cuit



`cuit`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-cuit.md "undefined#/properties/cuit")

### cuit Type

`string`

## descuentoPct



`descuentoPct`

* is optional

* Type: `number`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-descuentopct.md "undefined#/properties/descuentoPct")

### descuentoPct Type

`number`

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

## limiteCredito



`limiteCredito`

* is optional

* Type: `number`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-limitecredito.md "undefined#/properties/limiteCredito")

### limiteCredito Type

`number`

## moneda



`moneda`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-moneda.md "undefined#/properties/moneda")

### moneda Type

`string`

### moneda Default Value

The default value is:

```json
"ARS"
```

## notas



`notas`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-notas.md "undefined#/properties/notas")

### notas Type

`string`

## plazoHabitual



`plazoHabitual`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-plazohabitual.md "undefined#/properties/plazoHabitual")

### plazoHabitual Type

`integer`

### plazoHabitual Constraints

**minimum**: the value of this number must greater than or equal to: `0`

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

## tipoCuenta



`tipoCuenta`

* is optional

* Type: `string`

* cannot be null

* defined in: [ProveedorInput](proveedorinput-properties-tipocuenta.md "undefined#/properties/tipoCuenta")

### tipoCuenta Type

`string`

### tipoCuenta Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `"cc"` |             |
| `"ca"` |             |
