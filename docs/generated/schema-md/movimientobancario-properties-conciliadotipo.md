# Untitled string in MovimientoBancario Schema

```txt
undefined#/properties/conciliadoTipo
```

Kind of internal record this movement was reconciled against (#191).

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [MovimientoBancario.schema.json\*](../schema-json/MovimientoBancario.schema.json "open original schema") |

## conciliadoTipo Type

`string`

## conciliadoTipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value            | Explanation |
| :--------------- | :---------- |
| `"recibo_forma"` |             |
| `"cobro"`        |             |
| `null`           |             |
