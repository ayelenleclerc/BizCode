# FiscalJurisdictionCode Schema

```txt
undefined#/properties/jurisdiccionesHabilitadas/items
```

Tenant tax jurisdiction (#207, #210). Drives VAT rates, tax identifier validation and which modules are mandatory in production. Defaults to `AR`.

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [TenantFeaturesData.schema.json\*](../schema-json/TenantFeaturesData.schema.json "open original schema") |

## items Type

`string` ([FiscalJurisdictionCode](fiscaljurisdictioncode.md))

## items Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `"AR"` |             |
| `"UY"` |             |
| `"CL"` |             |
| `"MX"` |             |
