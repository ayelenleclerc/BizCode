# ReciboCobro Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReciboCobroListEnvelope.schema.json\*](../schema-json/ReciboCobroListEnvelope.schema.json "open original schema") |

## items Type

`object` ([ReciboCobro](recibocobro.md))

# items Properties

| Property                            | Type      | Required | Nullable       | Defined by                                                                                       |
| :---------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [anulacionMotivo](#anulacionmotivo) | `string`  | Optional | cannot be null | [ReciboCobro](recibocobro-properties-anulacionmotivo.md "undefined#/properties/anulacionMotivo") |
| [cliente](#cliente)                 | `object`  | Required | cannot be null | [ReciboCobro](recibocobro-properties-cliente.md "undefined#/properties/cliente")                 |
| [clienteId](#clienteid)             | `integer` | Required | cannot be null | [ReciboCobro](recibocobro-properties-clienteid.md "undefined#/properties/clienteId")             |
| [concepto](#concepto)               | `string`  | Optional | cannot be null | [ReciboCobro](recibocobro-properties-concepto.md "undefined#/properties/concepto")               |
| [createdAt](#createdat)             | `string`  | Required | cannot be null | [ReciboCobro](recibocobro-properties-createdat.md "undefined#/properties/createdAt")             |
| [estado](#estado)                   | `string`  | Required | cannot be null | [ReciboCobro](recibocobro-properties-estado.md "undefined#/properties/estado")                   |
| [fecha](#fecha)                     | `string`  | Required | cannot be null | [ReciboCobro](recibocobro-properties-fecha.md "undefined#/properties/fecha")                     |
| [formas](#formas)                   | `array`   | Required | cannot be null | [ReciboCobro](recibocobro-properties-formas.md "undefined#/properties/formas")                   |
| [id](#id)                           | `integer` | Required | cannot be null | [ReciboCobro](recibocobro-properties-id.md "undefined#/properties/id")                           |
| [imputaciones](#imputaciones)       | `array`   | Required | cannot be null | [ReciboCobro](recibocobro-properties-imputaciones.md "undefined#/properties/imputaciones")       |
| [numero](#numero)                   | `integer` | Required | cannot be null | [ReciboCobro](recibocobro-properties-numero.md "undefined#/properties/numero")                   |
| [retenciones](#retenciones)         | `array`   | Required | cannot be null | [ReciboCobro](recibocobro-properties-retenciones.md "undefined#/properties/retenciones")         |
| [totalBruto](#totalbruto)           | `string`  | Required | cannot be null | [ReciboCobro](recibocobro-properties-totalbruto.md "undefined#/properties/totalBruto")           |
| [totalCobrado](#totalcobrado)       | `string`  | Required | cannot be null | [ReciboCobro](recibocobro-properties-totalcobrado.md "undefined#/properties/totalCobrado")       |
| [usuario](#usuario)                 | `object`  | Required | cannot be null | [ReciboCobro](recibocobro-properties-usuario.md "undefined#/properties/usuario")                 |
| [usuarioId](#usuarioid)             | `integer` | Required | cannot be null | [ReciboCobro](recibocobro-properties-usuarioid.md "undefined#/properties/usuarioId")             |

## anulacionMotivo



`anulacionMotivo`

* is optional

* Type: `string`

* cannot be null

* defined in: [ReciboCobro](recibocobro-properties-anulacionmotivo.md "undefined#/properties/anulacionMotivo")

### anulacionMotivo Type

`string`

## cliente



`cliente`

* is required

* Type: `object` ([Details](recibocobro-properties-cliente.md))

* cannot be null

* defined in: [ReciboCobro](recibocobro-properties-cliente.md "undefined#/properties/cliente")

### cliente Type

`object` ([Details](recibocobro-properties-cliente.md))

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ReciboCobro](recibocobro-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## concepto



`concepto`

* is optional

* Type: `string`

* cannot be null

* defined in: [ReciboCobro](recibocobro-properties-concepto.md "undefined#/properties/concepto")

### concepto Type

`string`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [ReciboCobro](recibocobro-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [ReciboCobro](recibocobro-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"emitido"` |             |
| `"anulado"` |             |

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [ReciboCobro](recibocobro-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## formas



`formas`

* is required

* Type: `object[]` ([ReciboCobroForma](recibocobroforma.md))

* cannot be null

* defined in: [ReciboCobro](recibocobro-properties-formas.md "undefined#/properties/formas")

### formas Type

`object[]` ([ReciboCobroForma](recibocobroforma.md))

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [ReciboCobro](recibocobro-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## imputaciones



`imputaciones`

* is required

* Type: `object[]` ([ReciboCobroImputacion](recibocobroimputacion.md))

* cannot be null

* defined in: [ReciboCobro](recibocobro-properties-imputaciones.md "undefined#/properties/imputaciones")

### imputaciones Type

`object[]` ([ReciboCobroImputacion](recibocobroimputacion.md))

## numero



`numero`

* is required

* Type: `integer`

* cannot be null

* defined in: [ReciboCobro](recibocobro-properties-numero.md "undefined#/properties/numero")

### numero Type

`integer`

## retenciones



`retenciones`

* is required

* Type: `object[]` ([ReciboPagoRetencion](recibopagoretencion.md))

* cannot be null

* defined in: [ReciboCobro](recibocobro-properties-retenciones.md "undefined#/properties/retenciones")

### retenciones Type

`object[]` ([ReciboPagoRetencion](recibopagoretencion.md))

## totalBruto



`totalBruto`

* is required

* Type: `string`

* cannot be null

* defined in: [ReciboCobro](recibocobro-properties-totalbruto.md "undefined#/properties/totalBruto")

### totalBruto Type

`string`

## totalCobrado



`totalCobrado`

* is required

* Type: `string`

* cannot be null

* defined in: [ReciboCobro](recibocobro-properties-totalcobrado.md "undefined#/properties/totalCobrado")

### totalCobrado Type

`string`

## usuario



`usuario`

* is required

* Type: `object` ([Details](recibocobro-properties-usuario.md))

* cannot be null

* defined in: [ReciboCobro](recibocobro-properties-usuario.md "undefined#/properties/usuario")

### usuario Type

`object` ([Details](recibocobro-properties-usuario.md))

## usuarioId



`usuarioId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ReciboCobro](recibocobro-properties-usuarioid.md "undefined#/properties/usuarioId")

### usuarioId Type

`integer`
