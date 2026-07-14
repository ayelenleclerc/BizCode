# ContratoInput Schema

```txt
undefined#/allOf/0
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ContratoUpdateInput.schema.json\*](../schema-json/ContratoUpdateInput.schema.json "open original schema") |

## 0 Type

`object` ([ContratoInput](contratoinput.md))

# 0 Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                   |
| :-------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [ajuste](#ajuste)           | `object`  | Optional | cannot be null | [ContratoInput](contratoinput-properties-ajuste.md "undefined#/properties/ajuste")           |
| [clienteId](#clienteid)     | `integer` | Required | cannot be null | [ContratoInput](contratoinput-properties-clienteid.md "undefined#/properties/clienteId")     |
| [descripcion](#descripcion) | `string`  | Optional | cannot be null | [ContratoInput](contratoinput-properties-descripcion.md "undefined#/properties/descripcion") |
| [diaDelMes](#diadelmes)     | `integer` | Required | cannot be null | [ContratoInput](contratoinput-properties-diadelmes.md "undefined#/properties/diaDelMes")     |
| [fechaFin](#fechafin)       | `string`  | Optional | cannot be null | [ContratoInput](contratoinput-properties-fechafin.md "undefined#/properties/fechaFin")       |
| [fechaInicio](#fechainicio) | `string`  | Required | cannot be null | [ContratoInput](contratoinput-properties-fechainicio.md "undefined#/properties/fechaInicio") |
| [frecuencia](#frecuencia)   | `string`  | Required | cannot be null | [ContratoInput](contratofrecuencia.md "undefined#/properties/frecuencia")                    |
| [incluyeIVA](#incluyeiva)   | `boolean` | Optional | cannot be null | [ContratoInput](contratoinput-properties-incluyeiva.md "undefined#/properties/incluyeIVA")   |
| [items](#items)             | `array`   | Required | cannot be null | [ContratoInput](contratoinput-properties-items.md "undefined#/properties/items")             |
| [ivaAlicuota](#ivaalicuota) | `number`  | Optional | cannot be null | [ContratoInput](contratoinput-properties-ivaalicuota.md "undefined#/properties/ivaAlicuota") |
| [modoEmision](#modoemision) | `string`  | Optional | cannot be null | [ContratoInput](contratoinput-properties-modoemision.md "undefined#/properties/modoEmision") |
| [moneda](#moneda)           | `string`  | Optional | cannot be null | [ContratoInput](contratoinput-properties-moneda.md "undefined#/properties/moneda")           |
| [nombre](#nombre)           | `string`  | Required | cannot be null | [ContratoInput](contratoinput-properties-nombre.md "undefined#/properties/nombre")           |
| [prefijo](#prefijo)         | `string`  | Optional | cannot be null | [ContratoInput](contratoinput-properties-prefijo.md "undefined#/properties/prefijo")         |
| [proximaFact](#proximafact) | `string`  | Optional | cannot be null | [ContratoInput](contratoinput-properties-proximafact.md "undefined#/properties/proximaFact") |
| [tipoFactura](#tipofactura) | `string`  | Optional | cannot be null | [ContratoInput](contratoinput-properties-tipofactura.md "undefined#/properties/tipoFactura") |

## ajuste



`ajuste`

* is optional

* Type: `object` ([Details](contratoinput-properties-ajuste.md))

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-ajuste.md "undefined#/properties/ajuste")

### ajuste Type

`object` ([Details](contratoinput-properties-ajuste.md))

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

### clienteId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## descripcion



`descripcion`

* is optional

* Type: `string`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-descripcion.md "undefined#/properties/descripcion")

### descripcion Type

`string`

### descripcion Constraints

**maximum length**: the maximum number of characters for this string is: `500`

## diaDelMes



`diaDelMes`

* is required

* Type: `integer`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-diadelmes.md "undefined#/properties/diaDelMes")

### diaDelMes Type

`integer`

### diaDelMes Constraints

**maximum**: the value of this number must smaller than or equal to: `31`

**minimum**: the value of this number must greater than or equal to: `1`

## fechaFin



`fechaFin`

* is optional

* Type: `string`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-fechafin.md "undefined#/properties/fechaFin")

### fechaFin Type

`string`

## fechaInicio



`fechaInicio`

* is required

* Type: `string`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-fechainicio.md "undefined#/properties/fechaInicio")

### fechaInicio Type

`string`

## frecuencia



`frecuencia`

* is required

* Type: `string` ([ContratoFrecuencia](contratofrecuencia.md))

* cannot be null

* defined in: [ContratoInput](contratofrecuencia.md "undefined#/properties/frecuencia")

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

## incluyeIVA



`incluyeIVA`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-incluyeiva.md "undefined#/properties/incluyeIVA")

### incluyeIVA Type

`boolean`

## items



`items`

* is required

* Type: `object[]` ([Details](contratoinput-properties-items-items.md))

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([Details](contratoinput-properties-items-items.md))

### items Constraints

**minimum number of items**: the minimum number of items for this array is: `1`

## ivaAlicuota



`ivaAlicuota`

* is optional

* Type: `number`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-ivaalicuota.md "undefined#/properties/ivaAlicuota")

### ivaAlicuota Type

`number`

## modoEmision



`modoEmision`

* is optional

* Type: `string`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-modoemision.md "undefined#/properties/modoEmision")

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

* defined in: [ContratoInput](contratoinput-properties-moneda.md "undefined#/properties/moneda")

### moneda Type

`string`

### moneda Default Value

The default value is:

```json
"ARS"
```

## nombre



`nombre`

* is required

* Type: `string`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

### nombre Constraints

**maximum length**: the maximum number of characters for this string is: `120`

**minimum length**: the minimum number of characters for this string is: `1`

## prefijo



`prefijo`

* is optional

* Type: `string`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-prefijo.md "undefined#/properties/prefijo")

### prefijo Type

`string`

## proximaFact



`proximaFact`

* is optional

* Type: `string`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-proximafact.md "undefined#/properties/proximaFact")

### proximaFact Type

`string`

## tipoFactura



`tipoFactura`

* is optional

* Type: `string`

* cannot be null

* defined in: [ContratoInput](contratoinput-properties-tipofactura.md "undefined#/properties/tipoFactura")

### tipoFactura Type

`string`

### tipoFactura Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value | Explanation |
| :---- | :---------- |
| `"A"` |             |
| `"B"` |             |
