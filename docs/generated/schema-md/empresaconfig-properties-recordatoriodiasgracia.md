# Untitled integer in EmpresaConfig Schema

```txt
undefined#/properties/recordatorioDiasGracia
```

Grace days after due date before an invoice is eligible for collection reminders.

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                     |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [EmpresaConfig.schema.json\*](../schema-json/EmpresaConfig.schema.json "open original schema") |

## recordatorioDiasGracia Type

`integer`

## recordatorioDiasGracia Constraints

**maximum**: the value of this number must smaller than or equal to: `365`

**minimum**: the value of this number must greater than or equal to: `0`
