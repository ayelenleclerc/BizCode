# PresentacionOS Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PresentacionOSListEnvelope.schema.json\*](../schema-json/PresentacionOSListEnvelope.schema.json "open original schema") |

## items Type

`object` ([PresentacionOS](presentacionos.md))

# items Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                           |
| :-------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [archivoCsvName](#archivocsvname) | `string`  | Required | cannot be null | [PresentacionOS](presentacionos-properties-archivocsvname.md "undefined#/properties/archivoCsvName") |
| [createdAt](#createdat)           | `string`  | Required | cannot be null | [PresentacionOS](presentacionos-properties-createdat.md "undefined#/properties/createdAt")           |
| [estado](#estado)                 | `string`  | Required | cannot be null | [PresentacionOS](presentacionosestado.md "undefined#/properties/estado")                             |
| [fechaPago](#fechapago)           | `string`  | Required | cannot be null | [PresentacionOS](presentacionos-properties-fechapago.md "undefined#/properties/fechaPago")           |
| [id](#id)                         | `integer` | Required | cannot be null | [PresentacionOS](presentacionos-properties-id.md "undefined#/properties/id")                         |
| [importeCobrado](#importecobrado) | `number`  | Required | cannot be null | [PresentacionOS](presentacionos-properties-importecobrado.md "undefined#/properties/importeCobrado") |
| [obraSocialId](#obrasocialid)     | `integer` | Required | cannot be null | [PresentacionOS](presentacionos-properties-obrasocialid.md "undefined#/properties/obraSocialId")     |
| [periodo](#periodo)               | `string`  | Required | cannot be null | [PresentacionOS](presentacionos-properties-periodo.md "undefined#/properties/periodo")               |
| [rechazos](#rechazos)             | `array`   | Optional | cannot be null | [PresentacionOS](presentacionos-properties-rechazos.md "undefined#/properties/rechazos")             |
| [tenantId](#tenantid)             | `integer` | Required | cannot be null | [PresentacionOS](presentacionos-properties-tenantid.md "undefined#/properties/tenantId")             |
| [totalCredito](#totalcredito)     | `number`  | Required | cannot be null | [PresentacionOS](presentacionos-properties-totalcredito.md "undefined#/properties/totalCredito")     |
| [updatedAt](#updatedat)           | `string`  | Required | cannot be null | [PresentacionOS](presentacionos-properties-updatedat.md "undefined#/properties/updatedAt")           |
| [ventasCount](#ventascount)       | `integer` | Optional | cannot be null | [PresentacionOS](presentacionos-properties-ventascount.md "undefined#/properties/ventasCount")       |

## archivoCsvName



`archivoCsvName`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionOS](presentacionos-properties-archivocsvname.md "undefined#/properties/archivoCsvName")

### archivoCsvName Type

`string`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionOS](presentacionos-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## estado



`estado`

* is required

* Type: `string` ([PresentacionOsEstado](presentacionosestado.md))

* cannot be null

* defined in: [PresentacionOS](presentacionosestado.md "undefined#/properties/estado")

### estado Type

`string` ([PresentacionOsEstado](presentacionosestado.md))

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value            | Explanation |
| :--------------- | :---------- |
| `"generada"`     |             |
| `"presentada"`   |             |
| `"cobrada"`      |             |
| `"con_rechazos"` |             |

## fechaPago



`fechaPago`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionOS](presentacionos-properties-fechapago.md "undefined#/properties/fechaPago")

### fechaPago Type

`string`

### fechaPago Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [PresentacionOS](presentacionos-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## importeCobrado



`importeCobrado`

* is required

* Type: `number`

* cannot be null

* defined in: [PresentacionOS](presentacionos-properties-importecobrado.md "undefined#/properties/importeCobrado")

### importeCobrado Type

`number`

## obraSocialId



`obraSocialId`

* is required

* Type: `integer`

* cannot be null

* defined in: [PresentacionOS](presentacionos-properties-obrasocialid.md "undefined#/properties/obraSocialId")

### obraSocialId Type

`integer`

## periodo



`periodo`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionOS](presentacionos-properties-periodo.md "undefined#/properties/periodo")

### periodo Type

`string`

## rechazos



`rechazos`

* is optional

* Type: `object[]` ([PresentacionOSRechazo](presentacionosrechazo.md))

* cannot be null

* defined in: [PresentacionOS](presentacionos-properties-rechazos.md "undefined#/properties/rechazos")

### rechazos Type

`object[]` ([PresentacionOSRechazo](presentacionosrechazo.md))

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [PresentacionOS](presentacionos-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## totalCredito



`totalCredito`

* is required

* Type: `number`

* cannot be null

* defined in: [PresentacionOS](presentacionos-properties-totalcredito.md "undefined#/properties/totalCredito")

### totalCredito Type

`number`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionOS](presentacionos-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## ventasCount



`ventasCount`

* is optional

* Type: `integer`

* cannot be null

* defined in: [PresentacionOS](presentacionos-properties-ventascount.md "undefined#/properties/ventasCount")

### ventasCount Type

`integer`
