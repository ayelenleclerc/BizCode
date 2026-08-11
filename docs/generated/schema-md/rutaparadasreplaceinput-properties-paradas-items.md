# Untitled object in RutaParadasReplaceInput Schema

```txt
undefined#/properties/paradas/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RutaParadasReplaceInput.schema.json\*](../schema-json/RutaParadasReplaceInput.schema.json "open original schema") |

## items Type

`object` ([Details](rutaparadasreplaceinput-properties-paradas-items.md))

# items Properties

| Property                | Type      | Required | Nullable       | Defined by                                                                                                                                                     |
| :---------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid) | `integer` | Required | cannot be null | [RutaParadasReplaceInput](rutaparadasreplaceinput-properties-paradas-items-properties-clienteid.md "undefined#/properties/paradas/items/properties/clienteId") |
| [estado](#estado)       | `string`  | Optional | cannot be null | [RutaParadasReplaceInput](rutaparadaestado.md "undefined#/properties/paradas/items/properties/estado")                                                         |
| [motivo](#motivo)       | `string`  | Optional | cannot be null | [RutaParadasReplaceInput](rutaparadasreplaceinput-properties-paradas-items-properties-motivo.md "undefined#/properties/paradas/items/properties/motivo")       |
| [orden](#orden)         | `integer` | Required | cannot be null | [RutaParadasReplaceInput](rutaparadasreplaceinput-properties-paradas-items-properties-orden.md "undefined#/properties/paradas/items/properties/orden")         |

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [RutaParadasReplaceInput](rutaparadasreplaceinput-properties-paradas-items-properties-clienteid.md "undefined#/properties/paradas/items/properties/clienteId")

### clienteId Type

`integer`

### clienteId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## estado



`estado`

* is optional

* Type: `string` ([RutaParadaEstado](rutaparadaestado.md))

* cannot be null

* defined in: [RutaParadasReplaceInput](rutaparadaestado.md "undefined#/properties/paradas/items/properties/estado")

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

* defined in: [RutaParadasReplaceInput](rutaparadasreplaceinput-properties-paradas-items-properties-motivo.md "undefined#/properties/paradas/items/properties/motivo")

### motivo Type

`string`

### motivo Constraints

**maximum length**: the maximum number of characters for this string is: `200`

## orden



`orden`

* is required

* Type: `integer`

* cannot be null

* defined in: [RutaParadasReplaceInput](rutaparadasreplaceinput-properties-paradas-items-properties-orden.md "undefined#/properties/paradas/items/properties/orden")

### orden Type

`integer`

### orden Constraints

**minimum**: the value of this number must greater than or equal to: `0`
