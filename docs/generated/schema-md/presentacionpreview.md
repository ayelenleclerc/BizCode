# PresentacionPreview Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PresentacionPreviewEnvelope.schema.json\*](../schema-json/PresentacionPreviewEnvelope.schema.json "open original schema") |

## data Type

`object` ([PresentacionPreview](presentacionpreview.md))

# data Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                                           |
| :-------------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [canGenerate](#cangenerate)             | `boolean` | Required | cannot be null | [PresentacionPreview](presentacionpreview-properties-cangenerate.md "undefined#/properties/canGenerate")             |
| [filas](#filas)                         | `array`   | Required | cannot be null | [PresentacionPreview](presentacionpreview-properties-filas.md "undefined#/properties/filas")                         |
| [formato](#formato)                     | `string`  | Required | cannot be null | [PresentacionPreview](presentacionpreview-properties-formato.md "undefined#/properties/formato")                     |
| [periodo](#periodo)                     | `string`  | Required | cannot be null | [PresentacionPreview](presentacionpreview-properties-periodo.md "undefined#/properties/periodo")                     |
| [totalesPorRegimen](#totalesporregimen) | `array`   | Required | cannot be null | [PresentacionPreview](presentacionpreview-properties-totalesporregimen.md "undefined#/properties/totalesPorRegimen") |
| [warnings](#warnings)                   | `array`   | Required | cannot be null | [PresentacionPreview](presentacionpreview-properties-warnings.md "undefined#/properties/warnings")                   |

## canGenerate



`canGenerate`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PresentacionPreview](presentacionpreview-properties-cangenerate.md "undefined#/properties/canGenerate")

### canGenerate Type

`boolean`

## filas



`filas`

* is required

* Type: `object[]` ([PresentacionFila](presentacionfila.md))

* cannot be null

* defined in: [PresentacionPreview](presentacionpreview-properties-filas.md "undefined#/properties/filas")

### filas Type

`object[]` ([PresentacionFila](presentacionfila.md))

## formato



`formato`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionPreview](presentacionpreview-properties-formato.md "undefined#/properties/formato")

### formato Type

`string`

### formato Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value      | Explanation |
| :--------- | :---------- |
| `"sicore"` |             |
| `"sifere"` |             |

## periodo



`periodo`

* is required

* Type: `string`

* cannot be null

* defined in: [PresentacionPreview](presentacionpreview-properties-periodo.md "undefined#/properties/periodo")

### periodo Type

`string`

## totalesPorRegimen



`totalesPorRegimen`

* is required

* Type: `object[]` ([PresentacionTotalRegimen](presentaciontotalregimen.md))

* cannot be null

* defined in: [PresentacionPreview](presentacionpreview-properties-totalesporregimen.md "undefined#/properties/totalesPorRegimen")

### totalesPorRegimen Type

`object[]` ([PresentacionTotalRegimen](presentaciontotalregimen.md))

## warnings



`warnings`

* is required

* Type: `object[]` ([PresentacionWarning](presentacionwarning.md))

* cannot be null

* defined in: [PresentacionPreview](presentacionpreview-properties-warnings.md "undefined#/properties/warnings")

### warnings Type

`object[]` ([PresentacionWarning](presentacionwarning.md))
