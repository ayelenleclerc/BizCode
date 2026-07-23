# TransferenciaDeposito Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TransferenciaDepositoListEnvelope.schema.json\*](../schema-json/TransferenciaDepositoListEnvelope.schema.json "open original schema") |

## items Type

`object` ([TransferenciaDeposito](transferenciadeposito.md))

# items Properties

| Property                            | Type      | Required | Nullable       | Defined by                                                                                                           |
| :---------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [aprobadoPorId](#aprobadoporid)     | `integer` | Required | cannot be null | [TransferenciaDeposito](transferenciadeposito-properties-aprobadoporid.md "undefined#/properties/aprobadoPorId")     |
| [createdAt](#createdat)             | `string`  | Required | cannot be null | [TransferenciaDeposito](transferenciadeposito-properties-createdat.md "undefined#/properties/createdAt")             |
| [destinoCodigo](#destinocodigo)     | `string`  | Optional | cannot be null | [TransferenciaDeposito](transferenciadeposito-properties-destinocodigo.md "undefined#/properties/destinoCodigo")     |
| [destinoId](#destinoid)             | `integer` | Required | cannot be null | [TransferenciaDeposito](transferenciadeposito-properties-destinoid.md "undefined#/properties/destinoId")             |
| [estado](#estado)                   | `string`  | Required | cannot be null | [TransferenciaDeposito](transferenciadeposito-properties-estado.md "undefined#/properties/estado")                   |
| [fechaEnvio](#fechaenvio)           | `string`  | Required | cannot be null | [TransferenciaDeposito](transferenciadeposito-properties-fechaenvio.md "undefined#/properties/fechaEnvio")           |
| [fechaRecepcion](#fecharecepcion)   | `string`  | Required | cannot be null | [TransferenciaDeposito](transferenciadeposito-properties-fecharecepcion.md "undefined#/properties/fechaRecepcion")   |
| [id](#id)                           | `integer` | Required | cannot be null | [TransferenciaDeposito](transferenciadeposito-properties-id.md "undefined#/properties/id")                           |
| [items](#items)                     | `array`   | Optional | cannot be null | [TransferenciaDeposito](transferenciadeposito-properties-items.md "undefined#/properties/items")                     |
| [nota](#nota)                       | `string`  | Required | cannot be null | [TransferenciaDeposito](transferenciadeposito-properties-nota.md "undefined#/properties/nota")                       |
| [numero](#numero)                   | `integer` | Required | cannot be null | [TransferenciaDeposito](transferenciadeposito-properties-numero.md "undefined#/properties/numero")                   |
| [origenCodigo](#origencodigo)       | `string`  | Optional | cannot be null | [TransferenciaDeposito](transferenciadeposito-properties-origencodigo.md "undefined#/properties/origenCodigo")       |
| [origenId](#origenid)               | `integer` | Required | cannot be null | [TransferenciaDeposito](transferenciadeposito-properties-origenid.md "undefined#/properties/origenId")               |
| [solicitadoPorId](#solicitadoporid) | `integer` | Required | cannot be null | [TransferenciaDeposito](transferenciadeposito-properties-solicitadoporid.md "undefined#/properties/solicitadoPorId") |
| [tenantId](#tenantid)               | `integer` | Required | cannot be null | [TransferenciaDeposito](transferenciadeposito-properties-tenantid.md "undefined#/properties/tenantId")               |
| [updatedAt](#updatedat)             | `string`  | Required | cannot be null | [TransferenciaDeposito](transferenciadeposito-properties-updatedat.md "undefined#/properties/updatedAt")             |

## aprobadoPorId



`aprobadoPorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [TransferenciaDeposito](transferenciadeposito-properties-aprobadoporid.md "undefined#/properties/aprobadoPorId")

### aprobadoPorId Type

`integer`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [TransferenciaDeposito](transferenciadeposito-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## destinoCodigo



`destinoCodigo`

* is optional

* Type: `string`

* cannot be null

* defined in: [TransferenciaDeposito](transferenciadeposito-properties-destinocodigo.md "undefined#/properties/destinoCodigo")

### destinoCodigo Type

`string`

## destinoId



`destinoId`

* is required

* Type: `integer`

* cannot be null

* defined in: [TransferenciaDeposito](transferenciadeposito-properties-destinoid.md "undefined#/properties/destinoId")

### destinoId Type

`integer`

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [TransferenciaDeposito](transferenciadeposito-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"pendiente"`   |             |
| `"en_transito"` |             |
| `"recibida"`    |             |
| `"anulada"`     |             |

## fechaEnvio



`fechaEnvio`

* is required

* Type: `string`

* cannot be null

* defined in: [TransferenciaDeposito](transferenciadeposito-properties-fechaenvio.md "undefined#/properties/fechaEnvio")

### fechaEnvio Type

`string`

### fechaEnvio Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## fechaRecepcion



`fechaRecepcion`

* is required

* Type: `string`

* cannot be null

* defined in: [TransferenciaDeposito](transferenciadeposito-properties-fecharecepcion.md "undefined#/properties/fechaRecepcion")

### fechaRecepcion Type

`string`

### fechaRecepcion Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [TransferenciaDeposito](transferenciadeposito-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## items



`items`

* is optional

* Type: `object[]` ([TransferenciaDepositoItem](transferenciadepositoitem.md))

* cannot be null

* defined in: [TransferenciaDeposito](transferenciadeposito-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([TransferenciaDepositoItem](transferenciadepositoitem.md))

## nota



`nota`

* is required

* Type: `string`

* cannot be null

* defined in: [TransferenciaDeposito](transferenciadeposito-properties-nota.md "undefined#/properties/nota")

### nota Type

`string`

## numero



`numero`

* is required

* Type: `integer`

* cannot be null

* defined in: [TransferenciaDeposito](transferenciadeposito-properties-numero.md "undefined#/properties/numero")

### numero Type

`integer`

## origenCodigo



`origenCodigo`

* is optional

* Type: `string`

* cannot be null

* defined in: [TransferenciaDeposito](transferenciadeposito-properties-origencodigo.md "undefined#/properties/origenCodigo")

### origenCodigo Type

`string`

## origenId



`origenId`

* is required

* Type: `integer`

* cannot be null

* defined in: [TransferenciaDeposito](transferenciadeposito-properties-origenid.md "undefined#/properties/origenId")

### origenId Type

`integer`

## solicitadoPorId



`solicitadoPorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [TransferenciaDeposito](transferenciadeposito-properties-solicitadoporid.md "undefined#/properties/solicitadoPorId")

### solicitadoPorId Type

`integer`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [TransferenciaDeposito](transferenciadeposito-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [TransferenciaDeposito](transferenciadeposito-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
