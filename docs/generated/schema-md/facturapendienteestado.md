# FacturaPendienteEstado Schema

```txt
undefined#/properties/estado
```



| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                 |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [FacturaPendienteRow.schema.json\*](../schema-json/FacturaPendienteRow.schema.json "open original schema") |

## estado Type

`string` ([FacturaPendienteEstado](facturapendienteestado.md))

## estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value               | Explanation |
| :------------------ | :---------- |
| `"pendiente"`       |             |
| `"proxima_vencer"`  |             |
| `"vencida_hoy"`     |             |
| `"vencida_critica"` |             |
