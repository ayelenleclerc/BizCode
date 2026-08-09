# VisitaEstadoPlan Schema

```txt
undefined#/properties/estadoPlan
```



| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [VisitaUpdateInput.schema.json\*](../schema-json/VisitaUpdateInput.schema.json "open original schema") |

## estadoPlan Type

`string` ([VisitaEstadoPlan](visitaestadoplan.md))

## estadoPlan Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"pendiente"`   |             |
| `"completada"`  |             |
| `"no_visitada"` |             |
