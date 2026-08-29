# FiscalJurisdictionCode Schema

```txt
undefined#/properties/jurisdiccionFiscal
```

Tenant tax jurisdiction (#207). Drives VAT rates, tax identifier validation and which modules are mandatory in production. Defaults to `AR`.

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [TenantFeaturesData.schema.json\*](../schema-json/TenantFeaturesData.schema.json "open original schema") |

## jurisdiccionFiscal Type

`string` ([FiscalJurisdictionCode](fiscaljurisdictioncode.md))

## jurisdiccionFiscal Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `"AR"` |             |
| `"UY"` |             |
