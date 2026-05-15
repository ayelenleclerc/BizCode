# EmpresaInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [EmpresaInput.schema.json](../schema-json/EmpresaInput.schema.json "open original schema") |

## EmpresaInput Type

`object` ([EmpresaInput](empresainput.md))

# EmpresaInput Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                 |
| :-------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [cuit](#cuit)               | `string`  | Required | cannot be null | [EmpresaInput](empresainput-properties-cuit.md "undefined#/properties/cuit")               |
| [domicilio](#domicilio)     | `string`  | Optional | cannot be null | [EmpresaInput](empresainput-properties-domicilio.md "undefined#/properties/domicilio")     |
| [logoUrl](#logourl)         | `string`  | Optional | cannot be null | [EmpresaInput](empresainput-properties-logourl.md "undefined#/properties/logoUrl")         |
| [nombre](#nombre)           | `string`  | Required | cannot be null | [EmpresaInput](empresainput-properties-nombre.md "undefined#/properties/nombre")           |
| [puntoVenta](#puntoventa)   | `integer` | Required | cannot be null | [EmpresaInput](empresainput-properties-puntoventa.md "undefined#/properties/puntoVenta")   |
| [tipoFactura](#tipofactura) | `string`  | Required | cannot be null | [EmpresaInput](empresainput-properties-tipofactura.md "undefined#/properties/tipoFactura") |

## cuit



`cuit`

* is required

* Type: `string`

* cannot be null

* defined in: [EmpresaInput](empresainput-properties-cuit.md "undefined#/properties/cuit")

### cuit Type

`string`

### cuit Constraints

**maximum length**: the maximum number of characters for this string is: `14`

## domicilio



`domicilio`

* is optional

* Type: `string`

* cannot be null

* defined in: [EmpresaInput](empresainput-properties-domicilio.md "undefined#/properties/domicilio")

### domicilio Type

`string`

### domicilio Constraints

**maximum length**: the maximum number of characters for this string is: `40`

## logoUrl



`logoUrl`

* is optional

* Type: `string`

* cannot be null

* defined in: [EmpresaInput](empresainput-properties-logourl.md "undefined#/properties/logoUrl")

### logoUrl Type

`string`

### logoUrl Constraints

**maximum length**: the maximum number of characters for this string is: `255`

## nombre



`nombre`

* is required

* Type: `string`

* cannot be null

* defined in: [EmpresaInput](empresainput-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

### nombre Constraints

**maximum length**: the maximum number of characters for this string is: `40`

## puntoVenta



`puntoVenta`

* is required

* Type: `integer`

* cannot be null

* defined in: [EmpresaInput](empresainput-properties-puntoventa.md "undefined#/properties/puntoVenta")

### puntoVenta Type

`integer`

### puntoVenta Constraints

**maximum**: the value of this number must smaller than or equal to: `9999`

**minimum**: the value of this number must greater than or equal to: `1`

## tipoFactura



`tipoFactura`

* is required

* Type: `string`

* cannot be null

* defined in: [EmpresaInput](empresainput-properties-tipofactura.md "undefined#/properties/tipoFactura")

### tipoFactura Type

`string`

### tipoFactura Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value | Explanation |
| :---- | :---------- |
| `"A"` |             |
| `"B"` |             |
| `"C"` |             |
