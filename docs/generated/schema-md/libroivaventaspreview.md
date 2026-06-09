# LibroIvaVentasPreview Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LibroIvaVentasPreviewEnvelope.schema.json\*](../schema-json/LibroIvaVentasPreviewEnvelope.schema.json "open original schema") |

## data Type

`object` ([LibroIvaVentasPreview](libroivaventaspreview.md))

# data Properties

| Property                                        | Type      | Required | Nullable       | Defined by                                                                                                                       |
| :---------------------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [arcaValidationPending](#arcavalidationpending) | `boolean` | Required | cannot be null | [LibroIvaVentasPreview](libroivaventaspreview-properties-arcavalidationpending.md "undefined#/properties/arcaValidationPending") |
| [periodo](#periodo)                             | `string`  | Required | cannot be null | [LibroIvaVentasPreview](libroivaventaspreview-properties-periodo.md "undefined#/properties/periodo")                             |
| [recordCountAlicuotas](#recordcountalicuotas)   | `integer` | Required | cannot be null | [LibroIvaVentasPreview](libroivaventaspreview-properties-recordcountalicuotas.md "undefined#/properties/recordCountAlicuotas")   |
| [recordCountCbtv](#recordcountcbtv)             | `integer` | Required | cannot be null | [LibroIvaVentasPreview](libroivaventaspreview-properties-recordcountcbtv.md "undefined#/properties/recordCountCbtv")             |
| [totalExento](#totalexento)                     | `number`  | Required | cannot be null | [LibroIvaVentasPreview](libroivaventaspreview-properties-totalexento.md "undefined#/properties/totalExento")                     |
| [totalGeneral](#totalgeneral)                   | `number`  | Required | cannot be null | [LibroIvaVentasPreview](libroivaventaspreview-properties-totalgeneral.md "undefined#/properties/totalGeneral")                   |
| [totalIva](#totaliva)                           | `number`  | Required | cannot be null | [LibroIvaVentasPreview](libroivaventaspreview-properties-totaliva.md "undefined#/properties/totalIva")                           |
| [totalNeto](#totalneto)                         | `number`  | Required | cannot be null | [LibroIvaVentasPreview](libroivaventaspreview-properties-totalneto.md "undefined#/properties/totalNeto")                         |
| [totalsByAlicuota](#totalsbyalicuota)           | `array`   | Required | cannot be null | [LibroIvaVentasPreview](libroivaventaspreview-properties-totalsbyalicuota.md "undefined#/properties/totalsByAlicuota")           |

## arcaValidationPending



`arcaValidationPending`

* is required

* Type: `boolean`

* cannot be null

* defined in: [LibroIvaVentasPreview](libroivaventaspreview-properties-arcavalidationpending.md "undefined#/properties/arcaValidationPending")

### arcaValidationPending Type

`boolean`

### arcaValidationPending Constraints

**constant**: the value of this property must be equal to:

```json
true
```

## periodo



`periodo`

* is required

* Type: `string`

* cannot be null

* defined in: [LibroIvaVentasPreview](libroivaventaspreview-properties-periodo.md "undefined#/properties/periodo")

### periodo Type

`string`

### periodo Constraints

**pattern**: the string must match the following regular expression:&#x20;

```regexp
^\d{4}-\d{2}$
```

[try pattern](https://regexr.com/?expression=%5E%5Cd%7B4%7D-%5Cd%7B2%7D%24 "try regular expression with regexr.com")

## recordCountAlicuotas



`recordCountAlicuotas`

* is required

* Type: `integer`

* cannot be null

* defined in: [LibroIvaVentasPreview](libroivaventaspreview-properties-recordcountalicuotas.md "undefined#/properties/recordCountAlicuotas")

### recordCountAlicuotas Type

`integer`

### recordCountAlicuotas Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## recordCountCbtv



`recordCountCbtv`

* is required

* Type: `integer`

* cannot be null

* defined in: [LibroIvaVentasPreview](libroivaventaspreview-properties-recordcountcbtv.md "undefined#/properties/recordCountCbtv")

### recordCountCbtv Type

`integer`

### recordCountCbtv Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## totalExento



`totalExento`

* is required

* Type: `number`

* cannot be null

* defined in: [LibroIvaVentasPreview](libroivaventaspreview-properties-totalexento.md "undefined#/properties/totalExento")

### totalExento Type

`number`

## totalGeneral



`totalGeneral`

* is required

* Type: `number`

* cannot be null

* defined in: [LibroIvaVentasPreview](libroivaventaspreview-properties-totalgeneral.md "undefined#/properties/totalGeneral")

### totalGeneral Type

`number`

## totalIva



`totalIva`

* is required

* Type: `number`

* cannot be null

* defined in: [LibroIvaVentasPreview](libroivaventaspreview-properties-totaliva.md "undefined#/properties/totalIva")

### totalIva Type

`number`

## totalNeto



`totalNeto`

* is required

* Type: `number`

* cannot be null

* defined in: [LibroIvaVentasPreview](libroivaventaspreview-properties-totalneto.md "undefined#/properties/totalNeto")

### totalNeto Type

`number`

## totalsByAlicuota



`totalsByAlicuota`

* is required

* Type: `object[]` ([LibroIvaVentasAlicuotaTotal](libroivaventasalicuotatotal.md))

* cannot be null

* defined in: [LibroIvaVentasPreview](libroivaventaspreview-properties-totalsbyalicuota.md "undefined#/properties/totalsByAlicuota")

### totalsByAlicuota Type

`object[]` ([LibroIvaVentasAlicuotaTotal](libroivaventasalicuotatotal.md))
