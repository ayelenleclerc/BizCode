# CuentaBancaria Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CuentaBancariaEnvelope.schema.json\*](../schema-json/CuentaBancariaEnvelope.schema.json "open original schema") |

## data Type

`object` ([CuentaBancaria](cuentabancaria.md))

# data Properties

| Property                  | Type      | Required | Nullable       | Defined by                                                                                   |
| :------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [activo](#activo)         | `boolean` | Required | cannot be null | [CuentaBancaria](cuentabancaria-properties-activo.md "undefined#/properties/activo")         |
| [alias](#alias)           | `string`  | Optional | cannot be null | [CuentaBancaria](cuentabancaria-properties-alias.md "undefined#/properties/alias")           |
| [banco](#banco)           | `string`  | Required | cannot be null | [CuentaBancaria](cuentabancaria-properties-banco.md "undefined#/properties/banco")           |
| [cbu](#cbu)               | `string`  | Required | cannot be null | [CuentaBancaria](cuentabancaria-properties-cbu.md "undefined#/properties/cbu")               |
| [createdAt](#createdat)   | `string`  | Required | cannot be null | [CuentaBancaria](cuentabancaria-properties-createdat.md "undefined#/properties/createdAt")   |
| [id](#id)                 | `integer` | Required | cannot be null | [CuentaBancaria](cuentabancaria-properties-id.md "undefined#/properties/id")                 |
| [moneda](#moneda)         | `string`  | Required | cannot be null | [CuentaBancaria](cuentabancaria-properties-moneda.md "undefined#/properties/moneda")         |
| [tenantId](#tenantid)     | `integer` | Required | cannot be null | [CuentaBancaria](cuentabancaria-properties-tenantid.md "undefined#/properties/tenantId")     |
| [tipoCuenta](#tipocuenta) | `string`  | Required | cannot be null | [CuentaBancaria](cuentabancaria-properties-tipocuenta.md "undefined#/properties/tipoCuenta") |
| [updatedAt](#updatedat)   | `string`  | Required | cannot be null | [CuentaBancaria](cuentabancaria-properties-updatedat.md "undefined#/properties/updatedAt")   |

## activo



`activo`

* is required

* Type: `boolean`

* cannot be null

* defined in: [CuentaBancaria](cuentabancaria-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## alias



`alias`

* is optional

* Type: `string`

* cannot be null

* defined in: [CuentaBancaria](cuentabancaria-properties-alias.md "undefined#/properties/alias")

### alias Type

`string`

## banco



`banco`

* is required

* Type: `string`

* cannot be null

* defined in: [CuentaBancaria](cuentabancaria-properties-banco.md "undefined#/properties/banco")

### banco Type

`string`

## cbu



`cbu`

* is required

* Type: `string`

* cannot be null

* defined in: [CuentaBancaria](cuentabancaria-properties-cbu.md "undefined#/properties/cbu")

### cbu Type

`string`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [CuentaBancaria](cuentabancaria-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [CuentaBancaria](cuentabancaria-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## moneda



`moneda`

* is required

* Type: `string`

* cannot be null

* defined in: [CuentaBancaria](cuentabancaria-properties-moneda.md "undefined#/properties/moneda")

### moneda Type

`string`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [CuentaBancaria](cuentabancaria-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## tipoCuenta



`tipoCuenta`

* is required

* Type: `string`

* cannot be null

* defined in: [CuentaBancaria](cuentabancaria-properties-tipocuenta.md "undefined#/properties/tipoCuenta")

### tipoCuenta Type

`string`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [CuentaBancaria](cuentabancaria-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
