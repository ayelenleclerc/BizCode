# OrdenTrabajoEstado Schema

```txt
undefined#/allOf/1/properties/estado
```



| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [OrdenTrabajoUpdateInput.schema.json\*](../schema-json/OrdenTrabajoUpdateInput.schema.json "open original schema") |

## estado Type

`string` ([OrdenTrabajoEstado](ordentrabajoestado.md))

## estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value              | Explanation |
| :----------------- | :---------- |
| `"recibido"`       |             |
| `"diagnosticado"`  |             |
| `"presupuestado"`  |             |
| `"aprobado"`       |             |
| `"en_reparacion"`  |             |
| `"listo"`          |             |
| `"entregado"`      |             |
| `"facturado"`      |             |
| `"cancelado"`      |             |
| `"sin_reparacion"` |             |
