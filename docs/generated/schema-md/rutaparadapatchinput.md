# RutaParadaPatchInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RutaParadaPatchInput.schema.json](../schema-json/RutaParadaPatchInput.schema.json "open original schema") |

## RutaParadaPatchInput Type

`object` ([RutaParadaPatchInput](rutaparadapatchinput.md))

# RutaParadaPatchInput Properties

| Property              | Type      | Required | Nullable       | Defined by                                                                                           |
| :-------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [estado](#estado)     | `string`  | Required | cannot be null | [RutaParadaPatchInput](rutaparadaestado.md "undefined#/properties/estado")                           |
| [motivo](#motivo)     | `string`  | Optional | cannot be null | [RutaParadaPatchInput](rutaparadapatchinput-properties-motivo.md "undefined#/properties/motivo")     |
| [visitaId](#visitaid) | `integer` | Optional | cannot be null | [RutaParadaPatchInput](rutaparadapatchinput-properties-visitaid.md "undefined#/properties/visitaId") |

## estado



`estado`

* is required

* Type: `string` ([RutaParadaEstado](rutaparadaestado.md))

* cannot be null

* defined in: [RutaParadaPatchInput](rutaparadaestado.md "undefined#/properties/estado")

### estado Type

`string` ([RutaParadaEstado](rutaparadaestado.md))

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"pendiente"`   |             |
| `"visitado"`    |             |
| `"postergado"`  |             |
| `"no_visitado"` |             |

## motivo



`motivo`

* is optional

* Type: `string`

* cannot be null

* defined in: [RutaParadaPatchInput](rutaparadapatchinput-properties-motivo.md "undefined#/properties/motivo")

### motivo Type

`string`

### motivo Constraints

**maximum length**: the maximum number of characters for this string is: `200`

## visitaId



`visitaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [RutaParadaPatchInput](rutaparadapatchinput-properties-visitaid.md "undefined#/properties/visitaId")

### visitaId Type

`integer`

### visitaId Constraints

**minimum**: the value of this number must greater than or equal to: `1`
