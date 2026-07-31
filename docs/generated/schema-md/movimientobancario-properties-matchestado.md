# Untitled string in MovimientoBancario Schema

```txt
undefined#/properties/matchEstado
```

Reconciliation lifecycle state of this movement (#191).

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [MovimientoBancario.schema.json\*](../schema-json/MovimientoBancario.schema.json "open original schema") |

## matchEstado Type

`string`

## matchEstado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value              | Explanation |
| :----------------- | :---------- |
| `"unmatched"`      |             |
| `"suggested"`      |             |
| `"matched_auto"`   |             |
| `"matched_manual"` |             |
| `"ignored"`        |             |
| `"bank_fee"`       |             |
