# RutaParadaEstado Schema

```txt
undefined#/properties/paradas/items/properties/estado
```



| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [RutaParadasReplaceInput.schema.json\*](../schema-json/RutaParadasReplaceInput.schema.json "open original schema") |

## estado Type

`string` ([RutaParadaEstado](rutaparadaestado.md))

## estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"pendiente"`   |             |
| `"visitado"`    |             |
| `"postergado"`  |             |
| `"no_visitado"` |             |
