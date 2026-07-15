# Contrato Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ContratoListEnvelope.schema.json\*](../schema-json/ContratoListEnvelope.schema.json "open original schema") |

## items Type

`object` ([Contrato](contrato.md))

# items Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                         |
| :-------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------- |
| [clienteId](#clienteid)     | `integer` | Optional | cannot be null | [Contrato](contrato-properties-clienteid.md "undefined#/properties/clienteId")     |
| [createdAt](#createdat)     | `string`  | Optional | cannot be null | [Contrato](contrato-properties-createdat.md "undefined#/properties/createdAt")     |
| [descripcion](#descripcion) | `string`  | Optional | cannot be null | [Contrato](contrato-properties-descripcion.md "undefined#/properties/descripcion") |
| [diaDelMes](#diadelmes)     | `integer` | Optional | cannot be null | [Contrato](contrato-properties-diadelmes.md "undefined#/properties/diaDelMes")     |
| [estado](#estado)           | `string`  | Optional | cannot be null | [Contrato](contratoestado.md "undefined#/properties/estado")                       |
| [fechaFin](#fechafin)       | `string`  | Optional | cannot be null | [Contrato](contrato-properties-fechafin.md "undefined#/properties/fechaFin")       |
| [fechaInicio](#fechainicio) | `string`  | Optional | cannot be null | [Contrato](contrato-properties-fechainicio.md "undefined#/properties/fechaInicio") |
| [frecuencia](#frecuencia)   | `string`  | Optional | cannot be null | [Contrato](contratofrecuencia.md "undefined#/properties/frecuencia")               |
| [id](#id)                   | `integer` | Optional | cannot be null | [Contrato](contrato-properties-id.md "undefined#/properties/id")                   |
| [items](#items)             | `array`   | Optional | cannot be null | [Contrato](contrato-properties-items.md "undefined#/properties/items")             |
| [modoEmision](#modoemision) | `string`  | Optional | cannot be null | [Contrato](contrato-properties-modoemision.md "undefined#/properties/modoEmision") |
| [moneda](#moneda)           | `string`  | Optional | cannot be null | [Contrato](contrato-properties-moneda.md "undefined#/properties/moneda")           |
| [montoBase](#montobase)     | `number`  | Optional | cannot be null | [Contrato](contrato-properties-montobase.md "undefined#/properties/montoBase")     |
| [nombre](#nombre)           | `string`  | Optional | cannot be null | [Contrato](contrato-properties-nombre.md "undefined#/properties/nombre")           |
| [numero](#numero)           | `integer` | Optional | cannot be null | [Contrato](contrato-properties-numero.md "undefined#/properties/numero")           |
| [prefijo](#prefijo)         | `string`  | Optional | cannot be null | [Contrato](contrato-properties-prefijo.md "undefined#/properties/prefijo")         |
| [proximaFact](#proximafact) | `string`  | Optional | cannot be null | [Contrato](contrato-properties-proximafact.md "undefined#/properties/proximaFact") |
| [tenantId](#tenantid)       | `integer` | Optional | cannot be null | [Contrato](contrato-properties-tenantid.md "undefined#/properties/tenantId")       |
| [tipoFactura](#tipofactura) | `string`  | Optional | cannot be null | [Contrato](contrato-properties-tipofactura.md "undefined#/properties/tipoFactura") |
| [updatedAt](#updatedat)     | `string`  | Optional | cannot be null | [Contrato](contrato-properties-updatedat.md "undefined#/properties/updatedAt")     |
| Additional Properties       | Any       | Optional | can be null    |                                                                                    |

## clienteId



`clienteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Contrato](contrato-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## createdAt



`createdAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [Contrato](contrato-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## descripcion



`descripcion`

* is optional

* Type: `string`

* cannot be null

* defined in: [Contrato](contrato-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

## diaDelMes



`diaDelMes`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Contrato](contrato-properties-diadelmes.md "undefined#/properties/diaDelMes")

### diaDelMes Type

`integer`

### diaDelMes Constraints

**maximum**: the value of this number must smaller than or equal to: `31`

**minimum**: the value of this number must greater than or equal to: `1`

## estado



`estado`

* is optional

* Type: `string` ([ContratoEstado](contratoestado.md))

* cannot be null

* defined in: [Contrato](contratoestado.md "undefined#/properties/estado")

### estado Type

`string` ([ContratoEstado](contratoestado.md))

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"activo"`     |             |
| `"pausado"`    |             |
| `"finalizado"` |             |
| `"cancelado"`  |             |

## fechaFin



`fechaFin`

* is optional

* Type: `string`

* cannot be null

* defined in: [Contrato](contrato-properties-fechafin.md "undefined#/properties/fechaFin")

### fechaFin Type

`string`

### fechaFin Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## fechaInicio



`fechaInicio`

* is optional

* Type: `string`

* cannot be null

* defined in: [Contrato](contrato-properties-fechainicio.md "undefined#/properties/fechaInicio")

### fechaInicio Type

`string`

### fechaInicio Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## frecuencia



`frecuencia`

* is optional

* Type: `string` ([ContratoFrecuencia](contratofrecuencia.md))

* cannot be null

* defined in: [Contrato](contratofrecuencia.md "undefined#/properties/frecuencia")

### frecuencia Type

`string` ([ContratoFrecuencia](contratofrecuencia.md))

### frecuencia Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"mensual"`    |             |
| `"bimestral"`  |             |
| `"trimestral"` |             |
| `"semestral"`  |             |
| `"anual"`      |             |

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Contrato](contrato-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## items



`items`

* is optional

* Type: `object[]` ([ContratoItem](contratoitem.md))

* cannot be null

* defined in: [Contrato](contrato-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([ContratoItem](contratoitem.md))

## modoEmision



`modoEmision`

* is optional

* Type: `string`

* cannot be null

* defined in: [Contrato](contrato-properties-modoemision.md "undefined#/properties/modoEmision")

### modoEmision Type

`string`

### modoEmision Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"auto"`     |             |
| `"revision"` |             |

## moneda



`moneda`

* is optional

* Type: `string`

* cannot be null

* defined in: [Contrato](contrato-properties-moneda.md "undefined#/properties/moneda")

### moneda Type

`string`

## montoBase



`montoBase`

* is optional

* Type: `number`

* cannot be null

* defined in: [Contrato](contrato-properties-montobase.md "undefined#/properties/montoBase")

### montoBase Type

`number`

## nombre



`nombre`

* is optional

* Type: `string`

* cannot be null

* defined in: [Contrato](contrato-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

## numero



`numero`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Contrato](contrato-properties-numero.md "undefined#/properties/numero")

### numero Type

`integer`

## prefijo



`prefijo`

* is optional

* Type: `string`

* cannot be null

* defined in: [Contrato](contrato-properties-prefijo.md "undefined#/properties/prefijo")

### prefijo Type

`string`

## proximaFact



`proximaFact`

* is optional

* Type: `string`

* cannot be null

* defined in: [Contrato](contrato-properties-proximafact.md "undefined#/properties/proximaFact")

### proximaFact Type

`string`

### proximaFact Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## tenantId



`tenantId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [Contrato](contrato-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## tipoFactura



`tipoFactura`

* is optional

* Type: `string`

* cannot be null

* defined in: [Contrato](contrato-properties-tipofactura.md "undefined#/properties/tipoFactura")

### tipoFactura Type

`string`

### tipoFactura Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value | Explanation |
| :---- | :---------- |
| `"A"` |             |
| `"B"` |             |

## updatedAt



`updatedAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [Contrato](contrato-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
