# FiscalProviderCode Schema

```txt
undefined#/properties/provider
```



| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [FiscalProviderValidateInput.schema.json\*](../schema-json/FiscalProviderValidateInput.schema.json "open original schema") |

## provider Type

`string` ([FiscalProviderCode](fiscalprovidercode.md))

## provider Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value              | Explanation |
| :----------------- | :---------- |
| `"arca_wsfe"`      |             |
| `"uruguay_dgi"`    |             |
| `"chile_sii"`      |             |
| `"mexico_sat_pac"` |             |
