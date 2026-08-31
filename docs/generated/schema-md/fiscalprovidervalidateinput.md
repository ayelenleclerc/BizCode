# FiscalProviderValidateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FiscalProviderValidateInput.schema.json](../schema-json/FiscalProviderValidateInput.schema.json "open original schema") |

## FiscalProviderValidateInput Type

`object` ([FiscalProviderValidateInput](fiscalprovidervalidateinput.md))

# FiscalProviderValidateInput Properties

| Property              | Type     | Required | Nullable       | Defined by                                                                            |
| :-------------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------ |
| [provider](#provider) | `string` | Required | cannot be null | [FiscalProviderValidateInput](fiscalprovidercode.md "undefined#/properties/provider") |

## provider



`provider`

* is required

* Type: `string` ([FiscalProviderCode](fiscalprovidercode.md))

* cannot be null

* defined in: [FiscalProviderValidateInput](fiscalprovidercode.md "undefined#/properties/provider")

### provider Type

`string` ([FiscalProviderCode](fiscalprovidercode.md))

### provider Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value              | Explanation |
| :----------------- | :---------- |
| `"arca_wsfe"`      |             |
| `"uruguay_dgi"`    |             |
| `"chile_sii"`      |             |
| `"mexico_sat_pac"` |             |
