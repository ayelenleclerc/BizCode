# PresentacionFila Schema

```txt
undefined#/properties/filas/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PresentacionPreview.schema.json\*](../schema-json/PresentacionPreview.schema.json "open original schema") |

## items Type

`object` ([PresentacionFila](presentacionfila.md))

# items Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                             |
| :------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [alicuota](#alicuota)           | `string`  | Required | cannot be null | [PresentacionFila](presentacionfila-properties-alicuota.md "undefined#/properties/alicuota")           |
| [baseImponible](#baseimponible) | `string`  | Required | cannot be null | [PresentacionFila](presentacionfila-properties-baseimponible.md "undefined#/properties/baseImponible") |
| [cuit](#cuit)                   | `string`  | Required | cannot be null | [PresentacionFila](presentacionfila-properties-cuit.md "undefined#/properties/cuit")                   |
| [denominacion](#denominacion)   | `string`  | Required | cannot be null | [PresentacionFila](presentacionfila-properties-denominacion.md "undefined#/properties/denominacion")   |
| [fecha](#fecha)                 | `string`  | Required | cannot be null | [PresentacionFila](presentacionfila-properties-fecha.md "undefined#/properties/fecha")                 |
| [importe](#importe)             | `string`  | Required | cannot be null | [PresentacionFila](presentacionfila-properties-importe.md "undefined#/properties/importe")             |
| [incluida](#incluida)           | `boolean` | Required | cannot be null | [PresentacionFila](presentacionfila-properties-incluida.md "undefined#/properties/incluida")           |
| [operacionTipo](#operaciontipo) | `string`  | Required | cannot be null | [PresentacionFila](presentacionfila-properties-operaciontipo.md "undefined#/properties/operacionTipo") |
| [provincia](#provincia)         | `string`  | Optional | can be null    | [PresentacionFila](presentacionfila-properties-provincia.md "undefined#/properties/provincia")         |
| [regimenNombre](#regimennombre) | `string`  | Required | cannot be null | [PresentacionFila](presentacionfila-properties-regimennombre.md "undefined#/properties/regimenNombre") |
| [regimenTipo](#regimentipo)     | `string`  | Required | cannot be null | [PresentacionFila](presentacionfila-properties-regimentipo.md "undefined#/properties/regimenTipo")     |
| [retencionId](#retencionid)     | `integer` | Required | cannot be null | [PresentacionFila](presentacionfila-properties-retencionid.md "undefined#/properties/retencionId")     |

## alicuota



`alicuota`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionFila](presentacionfila-properties-alicuota.md "undefined#/properties/alicuota")

### alicuota Type

`string`

## baseImponible



`baseImponible`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionFila](presentacionfila-properties-baseimponible.md "undefined#/properties/baseImponible")

### baseImponible Type

`string`

## cuit



`cuit`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionFila](presentacionfila-properties-cuit.md "undefined#/properties/cuit")

### cuit Type

`string`

## denominacion



`denominacion`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionFila](presentacionfila-properties-denominacion.md "undefined#/properties/denominacion")

### denominacion Type

`string`

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionFila](presentacionfila-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## importe



`importe`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionFila](presentacionfila-properties-importe.md "undefined#/properties/importe")

### importe Type

`string`

## incluida



`incluida`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PresentacionFila](presentacionfila-properties-incluida.md "undefined#/properties/incluida")

### incluida Type

`boolean`

## operacionTipo



`operacionTipo`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionFila](presentacionfila-properties-operaciontipo.md "undefined#/properties/operacionTipo")

### operacionTipo Type

`string`

### operacionTipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"retencion"`  |             |
| `"percepcion"` |             |

## provincia



`provincia`

* is optional

* Type: `string`

* can be null

* defined in: [PresentacionFila](presentacionfila-properties-provincia.md "undefined#/properties/provincia")

### provincia Type

`string`

## regimenNombre



`regimenNombre`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionFila](presentacionfila-properties-regimennombre.md "undefined#/properties/regimenNombre")

### regimenNombre Type

`string`

## regimenTipo



`regimenTipo`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionFila](presentacionfila-properties-regimentipo.md "undefined#/properties/regimenTipo")

### regimenTipo Type

`string`

## retencionId



`retencionId`

* is required

* Type: `integer`

* cannot be null

* defined in: [PresentacionFila](presentacionfila-properties-retencionid.md "undefined#/properties/retencionId")

### retencionId Type

`integer`

### retencionId Constraints

**minimum**: the value of this number must greater than or equal to: `1`
