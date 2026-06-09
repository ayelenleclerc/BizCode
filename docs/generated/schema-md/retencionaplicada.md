# RetencionAplicada Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RetencionAplicadaListEnvelope.schema.json\*](../schema-json/RetencionAplicadaListEnvelope.schema.json "open original schema") |

## items Type

`object` ([RetencionAplicada](retencionaplicada.md))

# items Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [alicuota](#alicuota)           | `string`  | Required | cannot be null | [RetencionAplicada](retencionaplicada-properties-alicuota.md "undefined#/properties/alicuota")           |
| [baseImponible](#baseimponible) | `string`  | Required | cannot be null | [RetencionAplicada](retencionaplicada-properties-baseimponible.md "undefined#/properties/baseImponible") |
| [cobroId](#cobroid)             | `integer` | Optional | can be null    | [RetencionAplicada](retencionaplicada-properties-cobroid.md "undefined#/properties/cobroId")             |
| [constanciaNum](#constancianum) | `string`  | Optional | can be null    | [RetencionAplicada](retencionaplicada-properties-constancianum.md "undefined#/properties/constanciaNum") |
| [createdAt](#createdat)         | `string`  | Required | cannot be null | [RetencionAplicada](retencionaplicada-properties-createdat.md "undefined#/properties/createdAt")         |
| [entidadId](#entidadid)         | `integer` | Required | cannot be null | [RetencionAplicada](retencionaplicada-properties-entidadid.md "undefined#/properties/entidadId")         |
| [entidadTipo](#entidadtipo)     | `string`  | Required | cannot be null | [RetencionAplicada](retencionaplicada-properties-entidadtipo.md "undefined#/properties/entidadTipo")     |
| [facturaId](#facturaid)         | `integer` | Optional | can be null    | [RetencionAplicada](retencionaplicada-properties-facturaid.md "undefined#/properties/facturaId")         |
| [id](#id)                       | `integer` | Required | cannot be null | [RetencionAplicada](retencionaplicada-properties-id.md "undefined#/properties/id")                       |
| [importe](#importe)             | `string`  | Required | cannot be null | [RetencionAplicada](retencionaplicada-properties-importe.md "undefined#/properties/importe")             |
| [reciboPagoId](#recibopagoid)   | `integer` | Optional | can be null    | [RetencionAplicada](retencionaplicada-properties-recibopagoid.md "undefined#/properties/reciboPagoId")   |
| [regimenId](#regimenid)         | `integer` | Required | cannot be null | [RetencionAplicada](retencionaplicada-properties-regimenid.md "undefined#/properties/regimenId")         |
| [regimenNombre](#regimennombre) | `string`  | Required | cannot be null | [RetencionAplicada](retencionaplicada-properties-regimennombre.md "undefined#/properties/regimenNombre") |
| [tipo](#tipo)                   | `string`  | Required | cannot be null | [RetencionAplicada](retencionaplicada-properties-tipo.md "undefined#/properties/tipo")                   |

## alicuota



`alicuota`

* is required

* Type: `string`

* cannot be null

* defined in: [RetencionAplicada](retencionaplicada-properties-alicuota.md "undefined#/properties/alicuota")

### alicuota Type

`string`

## baseImponible



`baseImponible`

* is required

* Type: `string`

* cannot be null

* defined in: [RetencionAplicada](retencionaplicada-properties-baseimponible.md "undefined#/properties/baseImponible")

### baseImponible Type

`string`

## cobroId



`cobroId`

* is optional

* Type: `integer`

* can be null

* defined in: [RetencionAplicada](retencionaplicada-properties-cobroid.md "undefined#/properties/cobroId")

### cobroId Type

`integer`

### cobroId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## constanciaNum



`constanciaNum`

* is optional

* Type: `string`

* can be null

* defined in: [RetencionAplicada](retencionaplicada-properties-constancianum.md "undefined#/properties/constanciaNum")

### constanciaNum Type

`string`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [RetencionAplicada](retencionaplicada-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## entidadId



`entidadId`

* is required

* Type: `integer`

* cannot be null

* defined in: [RetencionAplicada](retencionaplicada-properties-entidadid.md "undefined#/properties/entidadId")

### entidadId Type

`integer`

### entidadId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## entidadTipo



`entidadTipo`

* is required

* Type: `string`

* cannot be null

* defined in: [RetencionAplicada](retencionaplicada-properties-entidadtipo.md "undefined#/properties/entidadTipo")

### entidadTipo Type

`string`

### entidadTipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value         | Explanation |
| :------------ | :---------- |
| `"cliente"`   |             |
| `"proveedor"` |             |

## facturaId



`facturaId`

* is optional

* Type: `integer`

* can be null

* defined in: [RetencionAplicada](retencionaplicada-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

### facturaId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [RetencionAplicada](retencionaplicada-properties-id.md "undefined#/properties/id")

### id Type

`integer`

### id Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## importe



`importe`

* is required

* Type: `string`

* cannot be null

* defined in: [RetencionAplicada](retencionaplicada-properties-importe.md "undefined#/properties/importe")

### importe Type

`string`

## reciboPagoId



`reciboPagoId`

* is optional

* Type: `integer`

* can be null

* defined in: [RetencionAplicada](retencionaplicada-properties-recibopagoid.md "undefined#/properties/reciboPagoId")

### reciboPagoId Type

`integer`

### reciboPagoId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## regimenId



`regimenId`

* is required

* Type: `integer`

* cannot be null

* defined in: [RetencionAplicada](retencionaplicada-properties-regimenid.md "undefined#/properties/regimenId")

### regimenId Type

`integer`

### regimenId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## regimenNombre



`regimenNombre`

* is required

* Type: `string`

* cannot be null

* defined in: [RetencionAplicada](retencionaplicada-properties-regimennombre.md "undefined#/properties/regimenNombre")

### regimenNombre Type

`string`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [RetencionAplicada](retencionaplicada-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`
